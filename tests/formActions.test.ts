import {
  ACTION_LABEL_NUMBER_OF_LINES,
  FORM_ACTION_MIN_WIDTH,
  FORM_ACTION_STACK_MAX_WIDTH,
  shouldStackFormActions,
} from "../components/ui/formActionLayout";
import { isFormDirty } from "../components/ui/formDirty";
import { shouldStackLockField } from "../components/ui/lockFieldLayout";
import en from "../locales/en.json";
import de from "../locales/de.json";

test("canonical CRUD labels live in common locale keys", () => {
  expect(en.common.add).toBe("Add");
  expect(en.common.save).toBe("Save");
  expect(en.common.cancel).toBe("Cancel");
  expect(de.common.add).toBe("Hinzufügen");
  expect(de.common.save).toBe("Speichern");
  expect(de.common.cancel).toBe("Abbrechen");
});

test("action labels are not configured for ellipsis", () => {
  expect(ACTION_LABEL_NUMBER_OF_LINES).toBeUndefined();
});

test("narrow widths stack form actions", () => {
  expect(shouldStackFormActions(0)).toBe(false);
  expect(shouldStackFormActions(FORM_ACTION_STACK_MAX_WIDTH - 1)).toBe(true);
  expect(shouldStackFormActions(FORM_ACTION_STACK_MAX_WIDTH)).toBe(false);
  expect(FORM_ACTION_MIN_WIDTH).toBeGreaterThanOrEqual(44);
});

test("narrow lock cards stack the lock accessory", () => {
  expect(shouldStackLockField(320)).toBe(true);
  expect(shouldStackLockField(500)).toBe(false);
});

test("isFormDirty still compares form snapshots", () => {
  expect(isFormDirty({ name: "a" }, { name: "a" })).toBe(false);
  expect(isFormDirty({ name: "a" }, { name: "b" })).toBe(true);
});
