const {
  applyIncrement,
  incrementPatchVersion,
  incrementVersionCode,
} = require("../scripts/increment-version.js");

test("increments the patch while preserving the 089 prefix", () => {
  expect(incrementPatchVersion("089.0.4")).toBe("089.0.5");
  expect(incrementPatchVersion("089.0.9")).toBe("089.0.10");
  expect(incrementPatchVersion("089.0.99")).toBe("089.0.100");
});

test("increments android versionCode independently", () => {
  expect(incrementVersionCode(2)).toBe(3);
  expect(incrementVersionCode(9)).toBe(10);
});

test("updates app.json version fields together", () => {
  const result = applyIncrement({
    expo: {
      version: "089.0.4",
      android: {
        package: "com.snackbearer.expodicecalculator",
        versionCode: 2,
      },
    },
  });
  expect(result.oldVersion).toBe("089.0.4");
  expect(result.nextVersion).toBe("089.0.5");
  expect(result.oldVersionCode).toBe(2);
  expect(result.nextVersionCode).toBe(3);
  expect(result.app.expo.version).toBe("089.0.5");
  expect(result.app.expo.android.versionCode).toBe(3);
  expect(result.app.expo.android.package).toBe(
    "com.snackbearer.expodicecalculator",
  );
});

test("fails clearly when version cannot be read", () => {
  expect(() => incrementPatchVersion("1.0.0")).toThrow(/Cannot read version/);
  expect(() => incrementVersionCode(undefined)).toThrow(
    /Cannot read android.versionCode/,
  );
  expect(() => applyIncrement({})).toThrow(/Cannot read version/);
});
