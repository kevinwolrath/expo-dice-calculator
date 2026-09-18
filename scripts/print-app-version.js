const fs = require("fs");
const path = require("path");

const { readExpectedAndroidVersion } = require("./android-version");

try {
  const appJsonPath = path.join(process.cwd(), "app.json");
  const { versionName, versionCode } = readExpectedAndroidVersion(
    JSON.parse(fs.readFileSync(appJsonPath, "utf8")),
  );
  console.log(`DiceForge versionName: ${versionName}`);
  console.log(`DiceForge versionCode: ${versionCode}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
