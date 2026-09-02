import type { ColourType, ColourTypeMaterialType, MaterialStock } from "./types";

export const colourTypeExclusionKey = (description: string) =>
  description.trim().toLowerCase();

export const expandColourTypeExclusions = (
  excludedColourTypeIds: string[],
  colourTypes: Pick<ColourType, "colour_type_id" | "description">[],
): string[] => {
  const excludedKeys = new Set(
    excludedColourTypeIds.flatMap((id) => {
      const type = colourTypes.find((item) => item.colour_type_id === id);
      return type ? [colourTypeExclusionKey(type.description)] : [];
    }),
  );
  return colourTypes
    .filter((type) =>
      excludedKeys.has(colourTypeExclusionKey(type.description)),
    )
    .map((type) => type.colour_type_id);
};

export const colourTypeMaterialMap = (
  links: Pick<ColourTypeMaterialType, "colour_type_id" | "material_type_id">[],
): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const link of links) {
    const current = map.get(link.colour_type_id) ?? [];
    current.push(link.material_type_id);
    map.set(link.colour_type_id, current);
  }
  return map;
};

export const materialTypeIdsForStock = (
  item: MaterialStock,
  colourTypeToMaterialTypes: Map<string, string[]>,
): string[] => colourTypeToMaterialTypes.get(item.colour_type_id) ?? [];

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
  colourTypeToMaterialTypes: Map<string, string[]> = new Map(),
  excludeColourTypeIds: string[] = [],
  colourTypes: Pick<ColourType, "colour_type_id" | "description">[] = [],
): MaterialStock[] => {
  if (!Number.isInteger(count) || count <= 0) {
    return [];
  }

  const excludedIds = new Set(excludeStockIds);
  const excludedColourTypes = new Set(
    colourTypes.length > 0
      ? expandColourTypeExclusions(excludeColourTypeIds, colourTypes)
      : excludeColourTypeIds,
  );
  const excludedNames = new Set(
    stock
      .filter((item) => excludedIds.has(item.material_stock_id))
      .map((item) => item.colour_name.trim().toLowerCase()),
  );

  let pool = stock.filter(
    (item) =>
      item.is_active !== 0 &&
      !excludedIds.has(item.material_stock_id) &&
      !excludedColourTypes.has(item.colour_type_id) &&
      !excludedNames.has(item.colour_name.trim().toLowerCase()),
  );
  if (allowedMaterialTypeIds) {
    const allowed = new Set(allowedMaterialTypeIds);
    pool = pool.filter((item) => {
      const materialTypeIds = materialTypeIdsForStock(
        item,
        colourTypeToMaterialTypes,
      );
      return materialTypeIds.some((id) => allowed.has(id));
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
  colourTypeToMaterialTypes: Map<string, string[]> = new Map(),
  excludeColourTypeIds: string[] = [],
  colourTypes: Pick<ColourType, "colour_type_id" | "description">[] = [],
): string | null => {
  const candidates = shuffleInPlace([...methodIds]).filter((methodId) => {
    const allowed = allowedByMethodId.get(methodId) ?? [];
    if (allowed.length === 0) return false;
    const allowedSet = new Set(allowed);
    return existingStockIds.every((stockId) => {
      const item = stock.find((row) => row.material_stock_id === stockId);
      if (!item) return false;
      return materialTypeIdsForStock(item, colourTypeToMaterialTypes).some(
        (id) => allowedSet.has(id),
      );
    });
  });

  const withEnough = candidates.filter((methodId) => {
    const allowed = allowedByMethodId.get(methodId) ?? [];
    return (
      pickRandomDistinctStock(
        stock,
        needed,
        allowed,
        existingStockIds,
        colourTypeToMaterialTypes,
        excludeColourTypeIds,
        colourTypes,
      ).length >= needed
    );
  });

  const pool = withEnough.length > 0 ? withEnough : candidates;
  return pool[0] ?? null;
};
