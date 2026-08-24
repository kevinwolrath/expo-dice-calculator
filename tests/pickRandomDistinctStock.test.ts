import type { MaterialStock } from "../db/types";
import { pickRandomCompatibleMethodId, pickRandomDistinctStock } from "../db/pickRandomDistinctStock";

const stock = (id: number, name: string, typeId = 1, active = 1): MaterialStock => ({
  material_stock_id: id,
  colour_name: name,
  material_type_id: typeId,
  quantity_in_stock: 10,
  is_active: active,
  created_at: "2026-01-01",
  updated_at: null,
});

test("picks the requested number of distinct colour names", () => {
  const picked = pickRandomDistinctStock(
    [stock(1, "Red"), stock(2, "Blue"), stock(3, "Black"), stock(4, "White")],
    3,
  );

  expect(picked).toHaveLength(3);
  const names = picked.map((item) => item.colour_name.toLowerCase());
  expect(new Set(names).size).toBe(3);
});

test("skips duplicate colour names and inactive stock", () => {
  const picked = pickRandomDistinctStock(
    [
      stock(1, "Red"),
      stock(2, "red", 2),
      stock(3, "Blue", 1, 0),
      stock(4, "Black"),
    ],
    2,
  );

  expect(picked).toHaveLength(2);
  expect(picked.map((item) => item.colour_name.toLowerCase()).sort()).toEqual([
    "black",
    "red",
  ]);
});

test("filters by allowed material types", () => {
  const picked = pickRandomDistinctStock(
    [stock(1, "Red", 1), stock(2, "Terracotta", 2), stock(3, "Blue", 1)],
    2,
    [2],
  );

  expect(picked).toHaveLength(1);
  expect(picked[0].colour_name).toBe("Terracotta");
});

test("skips already selected stock when filling remaining rows", () => {
  const picked = pickRandomDistinctStock(
    [stock(1, "Red"), stock(2, "Blue"), stock(3, "Black"), stock(4, "White")],
    2,
    null,
    [1, 2],
  );

  expect(picked).toHaveLength(2);
  expect(picked.map((item) => item.material_stock_id).sort()).toEqual([3, 4]);
});

test("empty allowed types yield no stock", () => {
  const picked = pickRandomDistinctStock([stock(1, "Red")], 1, []);
  expect(picked).toHaveLength(0);
});

test("picks a method compatible with existing stock types", () => {
  const allowedByMethodId = new Map<number, number[]>([
    [10, [1]],
    [20, [2]],
  ]);
  const methodId = pickRandomCompatibleMethodId(
    [10, 20],
    allowedByMethodId,
    [stock(1, "Red", 1), stock(2, "Terracotta", 2)],
    [2],
    1,
  );
  expect(methodId).toBe(20);
});
