interface NodeRequire {
  context(
    path: string,
    recursive?: boolean,
    filter?: RegExp,
  ): {
    keys(): string[];
    (id: string): unknown;
  };
}
