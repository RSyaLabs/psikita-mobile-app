/**
 * Expo SDK 52 Android template reads android.kotlinVersion from gradle.properties.
 * Didit Native SDK 4.12.1 is compiled with Kotlin 2.1 metadata, so the
 * default Kotlin 1.9 compiler cannot compile its React Native module.
 * Keep this targeted override until Expo is upgraded and validated.
 */
const { withGradleProperties } = require("@expo/config-plugins");

const KOTLIN_VERSION = "2.1.10";

function setAndroidKotlinVersion(properties) {
  return [
    ...properties.filter(
      (item) => !(item.type === "property" && item.key === "android.kotlinVersion"),
    ),
    { type: "property", key: "android.kotlinVersion", value: KOTLIN_VERSION },
  ];
}

function withAndroidKotlin(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = setAndroidKotlinVersion(config.modResults);
    return config;
  });
}

module.exports = withAndroidKotlin;
module.exports.setAndroidKotlinVersion = setAndroidKotlinVersion;
module.exports.KOTLIN_VERSION = KOTLIN_VERSION;
