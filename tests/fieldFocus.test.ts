import { firstErrorKey } from "../components/ui/fieldFocusOrder";

test("picks the first error in visual field order", () => {
  expect(
    firstErrorKey(
      { colourCount: "required", jobName: "required" },
      ["jobName", "materialTypeId", "methodId", "colourCount"],
    ),
  ).toBe("jobName");
});

test("skips empty error slots", () => {
  expect(
    firstErrorKey(
      { jobName: undefined, methodId: "required" },
      ["jobName", "methodId"],
    ),
  ).toBe("methodId");
});
