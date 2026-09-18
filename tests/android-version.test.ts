const { gradleContainsVersion } = require("../scripts/android-version.js");

test("matches Expo-generated versionName and versionCode lines", () => {
  const gradle = `
    defaultConfig {
        applicationId 'com.snackbearer.expodicecalculator'
        versionCode 2
        versionName "089.0.4"
    }
  `;
  expect(gradleContainsVersion(gradle, "089.0.4", 2)).toEqual({
    nameOk: true,
    codeOk: true,
  });
  expect(gradleContainsVersion(gradle, "089.0.5", 2).nameOk).toBe(false);
  expect(gradleContainsVersion(gradle, "089.0.4", 20).codeOk).toBe(false);
});
