const fs = require("fs");
const path = require("path");

const VERSION_PATTERN = /^(089)\.(\d+)\.(\d+)$/;

const incrementPatchVersion = (version) => {
  if (typeof version !== "string") {
    throw new Error("Cannot read version: expected a string like 089.0.4.");
  }
  const match = VERSION_PATTERN.exec(version);
  if (!match) {
    throw new Error(
      `Cannot read version: "${version}" must look like 089.0.4 (three-digit 089 prefix).`,
    );
  }
  const prefix = match[1];
  const minor = match[2];
  const patch = Number(match[3]);
  return `${prefix}.${minor}.${patch + 1}`;
};

const incrementVersionCode = (versionCode) => {
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error(
      `Cannot read android.versionCode: expected a positive integer, got ${JSON.stringify(versionCode)}.`,
    );
  }
  return versionCode + 1;
};

const applyIncrement = (app) => {
  if (!app || typeof app !== "object" || !app.expo || typeof app.expo !== "object") {
    throw new Error("Cannot read version: app.json is missing expo configuration.");
  }
  const oldVersion = app.expo.version;
  const oldVersionCode = app.expo.android && app.expo.android.versionCode;
  const nextVersion = incrementPatchVersion(oldVersion);
  const nextVersionCode = incrementVersionCode(oldVersionCode);
  return {
    app: {
      ...app,
      expo: {
        ...app.expo,
        version: nextVersion,
        android: {
          ...app.expo.android,
          versionCode: nextVersionCode,
        },
      },
    },
    oldVersion,
    nextVersion,
    oldVersionCode,
    nextVersionCode,
  };
};

const incrementAppJson = (appJsonPath) => {
  if (!fs.existsSync(appJsonPath)) {
    throw new Error(`Cannot read version: missing ${appJsonPath}.`);
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read version: ${appJsonPath} is not valid JSON.`);
  }
  const result = applyIncrement(parsed);
  fs.writeFileSync(appJsonPath, `${JSON.stringify(result.app, null, 2)}\n`);
  return result;
};

const main = () => {
  const appJsonPath = path.join(process.cwd(), "app.json");
  try {
    const result = incrementAppJson(appJsonPath);
    console.log("Version:");
    console.log(`${result.oldVersion} -> ${result.nextVersion}`);
    console.log("");
    console.log("Android versionCode:");
    console.log(`${result.oldVersionCode} -> ${result.nextVersionCode}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  applyIncrement,
  incrementAppJson,
  incrementPatchVersion,
  incrementVersionCode,
};
