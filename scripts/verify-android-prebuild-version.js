const fs = require("fs");
const path = require("path");

const { gradleContainsVersion, readExpectedAndroidVersion } = require("./android-version");

const appJsonPath = path.join(process.cwd(), "app.json");
const gradlePath = path.join(process.cwd(), "android", "app", "build.gradle");

try {
  const { versionName, versionCode } = readExpectedAndroidVersion(
    JSON.parse(fs.readFileSync(appJsonPath, "utf8")),
  );
  if (!fs.existsSync(gradlePath)) {
    throw new Error(`Missing ${gradlePath}. Run expo prebuild first.`);
  }
  const gradle = fs.readFileSync(gradlePath, "utf8");
  const { nameOk, codeOk } = gradleContainsVersion(gradle, versionName, versionCode);
  if (!nameOk || !codeOk) {
    const missing = [];
    if (!nameOk) missing.push(`versionName "${versionName}"`);
    if (!codeOk) missing.push(`versionCode ${versionCode}`);
    throw new Error(
      `Generated Android project is missing expected version (${missing.join(", ")}).`,
    );
  }
  console.log(
    `Generated Android project contains versionName "${versionName}" and versionCode ${versionCode}.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
