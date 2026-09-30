import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { DEV_FIXTURE_NOTICE, devFixturesEnabled } from "@/config/devFixtures";

/**
 * A permanent banner shown on every screen while development fixtures are on.
 *
 * Why this is not optional
 * -----------------------
 * Earlier in this repository, the practitioner history screen rendered three
 * invented practitioners with ICD-10 codes and a GAD-7 score, presented as a
 * genuine clinical record. Nothing on screen said any of it was invented. That
 * is the failure this component exists to prevent.
 *
 * It lives in the root layout rather than in each screen because a notice that
 * has to be remembered per screen will eventually be forgotten in one screen,
 * and that one screen is exactly where the damage happens. Placing it above the
 * navigator makes omission impossible rather than merely discouraged.
 *
 * The flag is inlined at build time, so a production build with it off carries
 * no fixture code on this path at all.
 */
export function DevFixtureBanner() {
  if (!devFixturesEnabled()) return null;

  return (
    <View
      // role and data-testid are the DOM spellings. accessibilityRole and
      // testID are React Native props that React DOM rejects outright, and this
      // component is rendered on web, so using them produced two console errors
      // in a build whose whole purpose is to be looked at.
      role="alert"
      data-testid="dev-fixture-banner"
      style={{
        backgroundColor: colors.sage[200],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: "center",
      }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color: colors.sage[600] }}
      >
        {DEV_FIXTURE_NOTICE}
      </Text>
    </View>
  );
}
