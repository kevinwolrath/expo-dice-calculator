import type { ColourType, MaterialStock } from "./types";

export const colourTypeMaterialMap = (
  colourTypes: Pick<ColourType, "colour_type_id" | "material_type_id">[],
): Map<string, string> =>
  new Map(
    colourTypes.map((type) => [type.colour_type_id, type.material_type_id]),
  );

export const materialTypeIdForStock = (
  item: MaterialStock,
  colourTypeToMaterialType: Map<string, string>,
): string | undefined => colourTypeToMaterialType.get(item.colour_type_id);

export const shuffleInPlace = <T>(items: T[]): T[] => {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = current;
  }
  return items;
};

export const pickRandomDistinctStock = (
  stock: MaterialStock[],
  count: number,
  allowedMaterialTypeIds?: string[] | null,
  excludeStockIds: string[] = [],
  colourTypeToMaterialType: Map<string, string> = new Map(),
): MaterialStock[] => {
  if (!Number.isInteger(count) || count <= 0) {
    return [];
  }

  const excludedIds = new Set(excludeStockIds);
  const excludedNames = new Set(
    stock
      .filter((item) => excludedIds.has(item.material_stock_id))
      .map((item) => item.colour_name.trim().toLowerCase()),
  );

  let pool = stock.filter(
    (item) =>
      item.is_active !== 0 &&
      !excludedIds.has(item.material_stock_id) &&
      !excludedNames.has(item.colour_name.trim().toLowerCase()),
  );
  if (allowedMaterialTypeIds) {
    const allowed = new Set(allowedMaterialTypeIds);
    pool = pool.filter((item) => {
      const materialTypeId = materialTypeIdForStock(
        item,
        colourTypeToMaterialType,
      );
      return materialTypeId !== undefined && allowed.has(materialTypeId);
    });
  }

  const shuffled = shuffleInPlace([...pool]);
  const seenNames = new Set<string>(excludedNames);
  const picked: MaterialStock[] = [];

  for (const item of shuffled) {
    const key = item.colour_name.trim().toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    picked.push(item);
    if (picked.length === count) break;
  }

  return picked;
};

export const pickRandomCompatibleMethodId = (
  methodIds: string[],
  allowedByMethodId: Map<string, string[]>,
  stock: MaterialStock[],
  existingStockIds: string[],
  needed: number,
  colourTypeToMaterialType: Map<string, string> = new Map(),
): string | null => {
  const existingTypes = new Set(
    stock
      .filter((item) => existingStockIds.includes(item.material_stock_id))
      .map((item) => materialTypeIdForStock(item, colourTypeToMaterialType))
      .filter((id): id is string => id !== undefined),
  );

  const candidates = shuffleInPlace([...methodIds]).filter((methodId) => {
    const allowed = allowedByMethodId.get(methodId) ?? [];
    if (allowed.length === 0) return false;
    const allowedSet = new Set(allowed);
    for (const typeId of existingTypes) {
      if (!allowedSet.has(typeId)) return false;
    }
    return true;
  });

  const withEnough = candidates.filter((methodId) => {
    const allowed = allowedByMethodId.get(methodId) ?? [];
    return (
      pickRandomDistinctStock(
        stock,
        needed,
        allowed,
        existingStockIds,
        colourTypeToMaterialType,
      ).length >= needed
    );
  });

  const pool = withEnough.length > 0 ? withEnough : candidates;
  return pool[0] ?? null;
};
