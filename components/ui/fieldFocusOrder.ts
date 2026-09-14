export const firstErrorKey = <K extends string>(
  errors: Partial<Record<K, string | undefined>>,
  order: readonly K[],
): K | undefined =>
  order.find((key) => {
    const message = errors[key];
    return typeof message === "string" && message.length > 0;
  });
