export const isFormDirty = (current: unknown, clean: unknown) =>
  JSON.stringify(current) !== JSON.stringify(clean);
