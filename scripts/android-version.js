const assertAndroidVersionCode = (versionCode) => {
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error(
      `Cannot read android.versionCode: expected a positive integer, got ${JSON.stringify(versionCode)}.`,
    );
  }
  return versionCode;
};

const readExpectedAndroidVersion = (app) => {
  const versionName = app && app.expo && app.expo.version;
  const versionCode = app && app.expo && app.expo.android && app.expo.android.versionCode;
  if (typeof versionName !== "string" || versionName.length === 0) {
    throw new Error("Cannot read expo.version from app.json.");
  }
  return { versionName, versionCode: assertAndroidVersionCode(versionCode) };
};

const gradleContainsVersion = (gradle, versionName, versionCode) => {
  const nameOk = new RegExp(
    `versionName\\s+"${versionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
  ).test(gradle);
  const codeOk = new RegExp(`versionCode\\s+${versionCode}(?!\\d)`).test(gradle);
  return { nameOk, codeOk };
};

module.exports = {
  assertAndroidVersionCode,
  gradleContainsVersion,
  readExpectedAndroidVersion,
};
