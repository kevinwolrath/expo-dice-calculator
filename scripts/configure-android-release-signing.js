const fs = require("fs");
const path = require("path");

const gradlePath = path.join("android", "app", "build.gradle");
const keystorePath = path.join("android", "app", "keystore.jks");
const marker = "/* diceforge-release-signing */";

if (!fs.existsSync(gradlePath)) {
  console.error("Missing android/app/build.gradle. Run expo prebuild first.");
  process.exit(1);
}

if (!fs.existsSync(keystorePath)) {
  console.error("Missing android/app/keystore.jks.");
  process.exit(1);
}

const contents = fs.readFileSync(gradlePath, "utf8");
if (contents.includes(marker)) {
  console.log("Release signing already configured in android/app/build.gradle.");
  process.exit(0);
}

const snippet = `

${marker}
android.signingConfigs {
    release {
        storeFile file("keystore.jks")
        storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
        keyAlias System.getenv("ANDROID_KEY_ALIAS")
        keyPassword System.getenv("ANDROID_KEY_PASSWORD")
    }
}
android.buildTypes.release.signingConfig android.signingConfigs.release
`;

fs.appendFileSync(gradlePath, snippet);
console.log("Configured release signing in android/app/build.gradle.");
