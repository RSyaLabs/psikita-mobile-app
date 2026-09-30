const ts = require('typescript');

const ROUTE_FIELD_NAMES = new Set([
  'actionRoute',
  'destination',
  'fallbackRoute',
  'homeRoute',
  'href',
  'nextRoute',
  'pathname',
  'redirectRoute',
  'route',
  'targetRoute',
]);

const ROUTE_VARIABLE_NAMES = new Set([
  ...ROUTE_FIELD_NAMES,
  'targetPath',
  'nextPath',
]);

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      (ts.isSatisfiesExpression && ts.isSatisfiesExpression(current)))
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text;
  return undefined;
}

function isExternalRouteLiteral(value) {
  return (
    value.startsWith('//') ||
    value.startsWith('#') ||
    /^(?:[a-z][a-z\d+.-]*:)/i.test(value)
  );
}

function isRouteLiteralCandidate(value, registryPaths) {
  return value.startsWith('/') || registryPaths.has(value);
}

function isRouterNavigationCall(node) {
  if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) {
    return false;
  }

  const target = node.expression;
  return (
    ts.isIdentifier(target.expression) &&
    target.expression.text === 'router' &&
    ['push', 'replace', 'navigate'].includes(target.name.text)
  );
}

function isDirectStringValue(expression, node) {
  const initializer = expression && unwrapExpression(expression);
  return initializer === node;
}

function isRoutePropertyValue(node, property) {
  let current = node.parent;
  while (current && current !== property) {
    if (ts.isConditionalExpression(current)) {
      let branch = node;
      while (branch.parent && branch.parent !== current) branch = branch.parent;
      if (branch === current.condition) return false;
    }
    current = current.parent;
  }
  return true;
}

function isRouteContext(node) {
  let current = node.parent;
  while (current) {
    if (ts.isPropertyAssignment(current)) {
      const name = propertyName(current.name);
      return !!name && ROUTE_FIELD_NAMES.has(name) && isRoutePropertyValue(node, current);
    }
    if (ts.isVariableDeclaration(current)) {
      return (
        ts.isIdentifier(current.name) &&
        ROUTE_VARIABLE_NAMES.has(current.name.text) &&
        isDirectStringValue(current.initializer, node)
      );
    }
    if (ts.isJsxAttribute(current)) {
      if (!ROUTE_FIELD_NAMES.has(current.name.text)) return false;
      if (!current.initializer) return false;
      if (ts.isStringLiteralLike(current.initializer)) {
        return current.initializer === node;
      }
      return (
        ts.isJsxExpression(current.initializer) &&
        unwrapExpression(current.initializer.expression) === node
      );
    }
    if (isRouterNavigationCall(current)) return true;
    current = current.parent;
  }
  return false;
}

function routeReferenceParts(node) {
  if (!ts.isPropertyAccessExpression(node)) return undefined;
  if (
    node.parent &&
    ts.isPropertyAccessExpression(node.parent) &&
    node.parent.expression === node
  ) {
    return undefined;
  }

  const parts = [];
  let current = node;
  while (ts.isPropertyAccessExpression(current)) {
    parts.unshift(current.name.text);
    current = current.expression;
  }
  if (!ts.isIdentifier(current) || current.text !== 'ROUTES') return undefined;
  return parts;
}

function sourceFileFor(filePath, source) {
  const extension = filePath.split('.').pop();
  const scriptKind =
    extension === 'tsx'
      ? ts.ScriptKind.TSX
      : extension === 'jsx'
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.TS;
  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, scriptKind);
}

function parseRouteConstants(source, filePath = 'src/constants/routes.ts') {
  const sourceFile = sourceFileFor(filePath, source);
  let routeObject;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'ROUTES' &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);
      if (initializer && ts.isObjectLiteralExpression(initializer)) {
        routeObject = initializer;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  const values = {};
  if (!routeObject) return values;

  function readObject(object, prefix = '') {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = propertyName(property.name);
      if (!name || !property.initializer) continue;
      const initializer = unwrapExpression(property.initializer);
      const key = prefix ? `${prefix}.${name}` : name;

      if (initializer && ts.isStringLiteralLike(initializer)) {
        values[key] = initializer.text;
      } else if (initializer && ts.isObjectLiteralExpression(initializer)) {
        readObject(initializer, key);
      }
    }
  }

  readObject(routeObject);
  return values;
}

function auditRouteSource({ filePath, source, registryPaths, routeReferenceValues }) {
  const sourceFile = sourceFileFor(filePath, source);
  const issues = [];
  let routeValueCount = 0;

  function addIssue(kind, value, node) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    issues.push({ kind, value, file: filePath, line: position.line + 1 });
  }

  function visit(node) {
    if (
      ts.isStringLiteralLike(node) &&
      isRouteContext(node) &&
      isRouteLiteralCandidate(node.text, registryPaths) &&
      !isExternalRouteLiteral(node.text)
    ) {
      routeValueCount += 1;
      if (!registryPaths.has(node.text)) {
        addIssue('route-literal', node.text, node);
      }
    }

    const parts = routeReferenceParts(node);
    if (parts) {
      routeValueCount += 1;
      const key = parts.join('.');
      const route = routeReferenceValues[key];
      if (!route || !registryPaths.has(route)) {
        addIssue('route-reference', `ROUTES.${key}`, node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { issues, routeValueCount };
}

module.exports = {
  auditRouteSource,
  parseRouteConstants,
};
