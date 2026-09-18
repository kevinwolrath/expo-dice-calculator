const {
  gradleContainsVersion,
  readExpectedAndroidVersion,
} = require("../scripts/android-version.js");

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

test("rejects invalid android versionCode values", () => {
  const app = (versionCode: unknown) => ({
    expo: { version: "089.0.4", android: { versionCode } },
  });
  expect(() => readExpectedAndroidVersion(app(undefined))).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(() => readExpectedAndroidVersion(app(0))).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(() => readExpectedAndroidVersion(app(-1))).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(() => readExpectedAndroidVersion(app(2.5))).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(() => readExpectedAndroidVersion(app("2"))).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(readExpectedAndroidVersion(app(2))).toEqual({
    versionName: "089.0.4",
    versionCode: 2,
  });
});
