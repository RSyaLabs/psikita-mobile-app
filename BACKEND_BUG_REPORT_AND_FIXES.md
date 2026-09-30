# Backend Bug Report & Code Patches (PsiKita Core API)

**Target Image**: `asia-southeast2-docker.pkg.dev/psikita-platform/psikita-shared-repo/core-api:v1.0.2-staging`  
**Date Reported**: 22 September 2026  
**Status on VPS**: Temporarily Hotfixed via Volume Mounts in `docker-compose.yml`  
**Required Action**: Merge the following fixes into the NestJS source code repository (`.ts`) and publish `v1.0.3-staging`.

---

## 1. Bug: Out-of-Order Database Migration
- **Problem**: `Migration20260913074329.ts` attempts to alter tables `consultation_feedbacks` and `billing_orders`. However, those tables are only created in subsequent migrations:
  - `Migration20260913100000.ts` (creates `consultation_feedbacks`)
  - `Migration20260913120000.ts` (creates `billing_orders`)
  Running MikroORM migration on a fresh database crashes with `relation "consultation_feedbacks" does not exist`.
- **Source Fix**:
  - Rename `Migration20260913074329.ts` to `Migration20260913130000.ts` so it executes after tables exist.
  - Wrap table alterations with defensive SQL clauses (`IF EXISTS` / `IF NOT EXISTS`).

---

## 2. Bug: Missing Query Handler in `PractitionerModule`
- **File**: `src/modules/practitioner/practitioner.module.ts`
- **Problem**: In the `@Module({ providers: [...] })` array, the developer imported `GetPractitionersQuery` instead of its query handler `GetPractitionersHandler`. Calling `GET /practitioner` throws:
  ```
  Error: No handler found for the query: "GetPractitionersQuery"
  ```
- **Source Fix**:
  ```diff
  - import { GetPractitionersQuery } from './application/queries/get-practitioners.query';
  + import { GetPractitionersHandler } from './application/queries/get-practitioners.handler';

    @Module({
      controllers: [PractitionerController, ...],
  -   providers: [GetPractitionersQuery, ...],
  +   providers: [GetPractitionersHandler, ...],
    })
    export class PractitionerModule {}
  ```

---

## 3. Bug: Unpopulated Relations in `PractitionerDao`
- **File**: `src/modules/practitioner/infrastructure/persistence/repositories/practitioner.dao.ts`
- **Problem**: `findByUserId`, `findById`, and `findAll` call `this.em.findOne` and `this.em.findAndCount` without populating relations. In MikroORM, child relations (`psychiatristProfile`, `psychologistProfile`, `educations`, `experiences`) remain unloaded references. When mapping to domain entity in `PractitionerMapper.toDomain`, calling `new PsychiatristProfile(profile.strNumber, ...)` passes `undefined`, throwing:
  ```
  TypeError: Cannot read properties of undefined (reading 'trim')
  ```
- **Source Fix**:
  ```diff
    async findByUserId(userId: string): Promise<Practitioner | null> {
  -   const entity = await this.em.findOne(PractitionerOrmEntity, { userId });
  +   const entity = await this.em.findOne(PractitionerOrmEntity, { userId }, { populate: ['*'] });
      return entity ? PractitionerMapper.toDomain(entity) : null;
    }

    async findById(id: string): Promise<Practitioner | null> {
  -   const entity = await this.em.findOne(PractitionerOrmEntity, { id });
  +   const entity = await this.em.findOne(PractitionerOrmEntity, { id }, { populate: ['*'] });
      return entity ? PractitionerMapper.toDomain(entity) : null;
    }

    async findAll(options: FindAllPractitionersOptions) {
      ...
  -   const [entities, count] = await this.em.findAndCount(PractitionerOrmEntity, filter, { limit, offset, orderBy });
  +   const [entities, count] = await this.em.findAndCount(PractitionerOrmEntity, filter, { limit, offset, orderBy, populate: ['*'] });
      ...
    }
  ```

---

## 4. Bug: Type Mismatch in `PsychologistProfileOrmEntity`
- **File**: `src/modules/practitioner/infrastructure/persistence/entities/psychologist-profile.orm-entity.ts`
- **Problem**: `createdAt` and `updatedAt` are decorated with `@Property({ type: 'string' })`, but the constructor initializes them with `new Date()`, and the PostgreSQL column is `timestamptz`. Creating a psychologist profile throws `500 ValidationError`:
  ```
  ValidationError: Trying to set PsychologistProfileOrmEntity.createdAt of type 'string' to [Date] of type 'Date'
  ```
- **Source Fix**:
  ```diff
  - @Property({ type: 'string', fieldName: 'created_at' })
  + @Property({ type: 'Date', fieldName: 'created_at' })
    createdAt: Date = new Date();

  - @Property({ type: 'string', fieldName: 'updated_at' })
  + @Property({ type: 'Date', fieldName: 'updated_at' })
    updatedAt: Date = new Date();
  ```

---

## 5. Bug: CASL Role Permissions Gatekeeper Missing `Practitioner` Subjects
- **File**: `src/modules/iam/application/authorization/ability.factory.ts` (or permissions seed)
- **Problem**: Neither `ADMIN`, `PSYCHOLOGIST`, nor `PSYCHIATRIST` default role definitions contain permissions for `Practitioner` or `PractitionerProfile`. Calling `GET /practitioner` or `GET /practitioner/me` throws `403 Forbidden: Access denied: lacking "read" permission on "Practitioner"`.
- **Source Fix**:
  Include `Practitioner` and `PractitionerProfile` in the CASL role definition matrix:
  ```typescript
  // For ADMIN:
  { action: 'manage', subject: 'Practitioner' },
  { action: 'read', subject: 'Practitioner' },
  { action: 'manage', subject: 'PractitionerProfile' },
  { action: 'read', subject: 'PractitionerProfile' },

  // For PSYCHOLOGIST & PSYCHIATRIST:
  { action: 'read', subject: 'PractitionerProfile' },
  { action: 'update', subject: 'PractitionerProfile' },
  { action: 'read', subject: 'Practitioner' },
  ```
