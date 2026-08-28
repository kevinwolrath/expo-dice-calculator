let jestGlobal: any = (globalThis as any).jest;
if (typeof jest !== "undefined") jestGlobal = jest;
const isJest = typeof jestGlobal !== "undefined";

export const initDatabase = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export const listMaterialTypes = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        material_type_id: 1,
        description: "Type A",
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        material_type_id: 1,
        description: "Type A",
        created_at: new Date().toISOString(),
      },
    ];

export const listMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        material_stock_id: 1,
        colour_name: "Red",
        material_type_id: 1,
        colour_type_id: 1,
        quantity_in_stock: 5,
        is_active: 1,
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        material_stock_id: 1,
        colour_name: "Red",
        material_type_id: 1,
        colour_type_id: 1,
        quantity_in_stock: 5,
        is_active: 1,
        created_at: new Date().toISOString(),
      },
    ];

export const createMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue({
      material_type_id: 2,
      description: "Type B",
      created_at: new Date().toISOString(),
    })
  : async () => ({
      material_type_id: 2,
      description: "Type B",
      created_at: new Date().toISOString(),
    });

export const updateMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;
export const deleteMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export const createMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue({
      material_stock_id: 2,
      colour_name: "Blue",
      material_type_id: 1,
      colour_type_id: 1,
      quantity_in_stock: 2,
      is_active: 1,
      created_at: new Date().toISOString(),
    })
  : async () => ({
      material_stock_id: 2,
      colour_name: "Blue",
      material_type_id: 1,
      colour_type_id: 1,
      quantity_in_stock: 2,
      is_active: 1,
      created_at: new Date().toISOString(),
    });

export const updateMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;
export const deleteMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export default {
  initDatabase,
  listMaterialTypes,
  listMaterialStock,
  createMaterialType,
  updateMaterialType,
  deleteMaterialType,
  createMaterialStock,
  updateMaterialStock,
  deleteMaterialStock,
};
