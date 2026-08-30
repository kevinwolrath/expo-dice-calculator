let jestGlobal: any = (globalThis as any).jest;
if (typeof jest !== "undefined") jestGlobal = jest;
const isJest = typeof jestGlobal !== "undefined";

export const initDatabase = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export const listMaterialTypes = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        material_type_id: "1",
        description: "Type A",
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        material_type_id: "1",
        description: "Type A",
        created_at: new Date().toISOString(),
      },
    ];

export const listMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        material_stock_id: "1",
        colour_name: "Red",
        comment: null,
        colour_type_id: "1",
        colour_brand_id: null,
        quantity_in_stock: 5,
        is_active: 1,
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        material_stock_id: "1",
        colour_name: "Red",
        comment: null,
        colour_type_id: "1",
        colour_brand_id: null,
        quantity_in_stock: 5,
        is_active: 1,
        created_at: new Date().toISOString(),
      },
    ];

export const createMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue({
      material_type_id: "2",
      description: "Type B",
      created_at: new Date().toISOString(),
    })
  : async () => ({
      material_type_id: "2",
      description: "Type B",
      created_at: new Date().toISOString(),
    });

export const updateMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;
export const deleteMaterialType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export const listColourTypes = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        colour_type_id: "1",
        description: "Mica powder",
        material_type_id: "1",
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        colour_type_id: "1",
        description: "Mica powder",
        material_type_id: "1",
        created_at: new Date().toISOString(),
      },
    ];

export const createColourType = isJest
  ? jestGlobal.fn().mockResolvedValue({
      colour_type_id: "2",
      description: "Glitter",
      material_type_id: "1",
      created_at: new Date().toISOString(),
    })
  : async () => ({
      colour_type_id: "2",
      description: "Glitter",
      material_type_id: "1",
      created_at: new Date().toISOString(),
    });

export const updateColourType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;
export const deleteColourType = isJest
  ? jestGlobal.fn().mockResolvedValue(undefined)
  : async () => undefined;

export const listColourBrands = isJest
  ? jestGlobal.fn().mockResolvedValue([
      {
        colour_brand_id: "1",
        colour_brand_name: "Piñata",
        created_at: new Date().toISOString(),
      },
    ])
  : async () => [
      {
        colour_brand_id: "1",
        colour_brand_name: "Piñata",
        created_at: new Date().toISOString(),
      },
    ];

export const createMaterialStock = isJest
  ? jestGlobal.fn().mockResolvedValue({
      material_stock_id: "2",
      colour_name: "Blue",
      comment: null,
      colour_type_id: "1",
      colour_brand_id: null,
      quantity_in_stock: 2,
      is_active: 1,
      created_at: new Date().toISOString(),
    })
  : async () => ({
      material_stock_id: "2",
      colour_name: "Blue",
      comment: null,
      colour_type_id: "1",
      colour_brand_id: null,
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
  listColourTypes,
  createColourType,
  updateColourType,
  deleteColourType,
  listColourBrands,
  createMaterialStock,
  updateMaterialStock,
  deleteMaterialStock,
};
