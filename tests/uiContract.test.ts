import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");

const walk = (dir: string, files: string[] = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(next, files);
      continue;
    }
    if (/\.(tsx|ts)$/.test(entry.name)) files.push(next);
  }
  return files;
};

const PROHIBITED =
  /["'`](Add job|Save job|Add Job|Save Job|Create Job|Save Changes|Add colour|Save changes|Save colour|Add type|Save type|Add method|Save method)["'`]/;

test("UI source does not use contextual CRUD action labels", () => {
  const files = [
    ...walk(path.join(ROOT, "app")),
    ...walk(path.join(ROOT, "components")),
  ];
  const hits: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (PROHIBITED.test(text)) hits.push(path.relative(ROOT, file));
  }
  expect(hits).toEqual([]);
});

test("PrimaryButton does not ellipsize action labels", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "components", "ui", "PrimaryButton.tsx"),
    "utf8",
  );
  expect(source).not.toMatch(/numberOfLines\s*=\s*\{\s*1\s*\}/);
  expect(source).not.toMatch(/ellipsizeMode/);
});

test("FormActions uses shared common action keys", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "components", "ui", "FormActions.tsx"),
    "utf8",
  );
  expect(source).toMatch(/t\("common.add"\)/);
  expect(source).toMatch(/t\("common.save"\)/);
  expect(source).toMatch(/t\("common.cancel"\)/);
});

test("PrimaryButton exposes button accessibility metadata", () => {
  const source = fs.readFileSync(
    path.join(ROOT, "components", "ui", "PrimaryButton.tsx"),
    "utf8",
  );
  expect(source).toMatch(/accessibilityRole="button"/);
  expect(source).toMatch(/accessibilityState/);
  expect(source).toMatch(/accessibilityLabel/);
});
