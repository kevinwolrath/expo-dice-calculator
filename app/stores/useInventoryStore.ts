import type {
  ColourBrand,
  ColourType,
  ColourTypeMaterialType,
  ColourTypeService,
  MaterialStock,
  MaterialStockService,
  MaterialType,
  MaterialTypeService,
} from "@/db";
import {
  createMaterialStock,
  createMaterialType,
  deleteMaterialStock,
  deleteMaterialType,
  initDatabase,
  createColourType as insertColourType,
  listAllColourTypeMaterials,
  listColourBrands,
  listColourTypes,
  listMaterialStock,
  listMaterialTypes,
  updateColourType as patchColourType,
  deleteColourType as removeColourType,
  updateMaterialStock,
  updateMaterialType,
} from "@/db";
import { colourFromName } from "@/constants/colourFromName";
import { create } from "zustand";

type CreateMaterialTypeInput = Parameters<
  MaterialTypeService["createMaterialType"]
>[0];
type UpdateMaterialTypeInput = Parameters<
  MaterialTypeService["updateMaterialType"]
>[1];
type CreateMaterialStockInput = Parameters<
  MaterialStockService["createMaterialStock"]
>[0];
type UpdateMaterialStockInput = Parameters<
  MaterialStockService["updateMaterialStock"]
>[1];
type CreateColourTypeInput = Parameters<
  ColourTypeService["createColourType"]
>[0];
type UpdateColourTypeInput = Parameters<
  ColourTypeService["updateColourType"]
>[1];

type InventoryState = {
  types: MaterialType[];
  colourTypes: ColourType[];
  colourTypeMaterials: ColourTypeMaterialType[];
  colourBrands: ColourBrand[];
  stock: MaterialStock[];
  loading: boolean;

  loadAll: () => Promise<void>;
  loadTypes: () => Promise<void>;
  loadColourTypes: () => Promise<void>;
  loadColourBrands: () => Promise<void>;
  loadStock: () => Promise<void>;

  createType: (input: CreateMaterialTypeInput) => Promise<MaterialType>;
  updateType: (id: string, input: UpdateMaterialTypeInput) => Promise<void>;
  deleteType: (id: string) => Promise<void>;

  createColourType: (input: CreateColourTypeInput) => Promise<ColourType>;
  updateColourType: (id: string, input: UpdateColourTypeInput) => Promise<void>;
  deleteColourType: (id: string) => Promise<void>;

  createStock: (input: CreateMaterialStockInput) => Promise<MaterialStock>;
  updateStock: (id: string, input: UpdateMaterialStockInput) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
};

// Perf note (fix #4): every mutation below applies its change to local state
// directly (optimistic add/merge/remove) instead of re-fetching the whole
// table from SQLite afterwards. The previous version did an optimistic
// update *and then* immediately re-listed the full table (sometimes twice,
// once just to snapshot a rollback value that was already sitting in
// state) — up to 3 DB round-trips and 2 full-list re-renders per edit. Since
// `create*` already returns the created row and we know exactly which
// fields an update/delete touched, no re-fetch is needed; the `prev`
// snapshot for rollback comes from the `set` updater's own state, not a
// fresh read.

export const useInventoryStore = create<InventoryState>((set) => ({
  types: [],
  colourTypes: [],
  colourTypeMaterials: [],
  colourBrands: [],
  stock: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      await initDatabase();
      const [types, colourTypes, colourTypeMaterials, colourBrands, stock] =
        await Promise.all([
          listMaterialTypes(),
          listColourTypes(),
          listAllColourTypeMaterials(),
          listColourBrands(),
          listMaterialStock(),
        ]);
      set({ types, colourTypes, colourTypeMaterials, colourBrands, stock });
    } finally {
      set({ loading: false });
    }
  },

  loadTypes: async () => {
    set({ loading: true });
    try {
      const types = await listMaterialTypes();
      set({ types });
    } finally {
      set({ loading: false });
    }
  },

  loadColourTypes: async () => {
    set({ loading: true });
    try {
      const colourTypes = await listColourTypes();
      const colourTypeMaterials = await listAllColourTypeMaterials();
      set({ colourTypes, colourTypeMaterials });
    } finally {
      set({ loading: false });
    }
  },

  loadColourBrands: async () => {
    set({ loading: true });
    try {
      const colourBrands = await listColourBrands();
      set({ colourBrands });
    } finally {
      set({ loading: false });
    }
  },

  loadStock: async () => {
    set({ loading: true });
    try {
      const stock = await listMaterialStock();
      set({ stock });
    } finally {
      set({ loading: false });
    }
  },

  createType: async (input) => {
    // optimistic: add a temporary type immediately, then swap it for the
    // real row `createMaterialType` returns — no extra list re-fetch.
    const tempId = `temp-${Date.now()}`;
    set((s) => ({
      types: [
        ...s.types,
        {
          material_type_id: tempId,
          description: input.description,
          created_at: new Date().toISOString(),
        },
      ],
      loading: true,
    }));
    try {
      const created = await createMaterialType(input);
      set((s) => ({
        types: s.types.map((t) =>
          t.material_type_id === tempId ? created : t,
        ),
      }));
      return created;
    } catch (e) {
      // rollback: drop the temporary row
      set((s) => ({
        types: s.types.filter((t) => t.material_type_id !== tempId),
      }));
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateType: async (id, input) => {
    let prev: MaterialType[] | undefined;
    set((s) => {
      prev = s.types;
      return {
        types: s.types.map((t) =>
          t.material_type_id === id
            ? {
                ...t,
                description:
                  input.description !== undefined && input.description !== null
                    ? input.description
                    : t.description,
              }
            : t,
        ),
        loading: true,
      };
    });
    try {
      await updateMaterialType(id, input);
    } catch (e) {
      if (prev) set({ types: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteType: async (id: string) => {
    let prev: MaterialType[] | undefined;
    set((s) => {
      prev = s.types;
      return {
        types: s.types.filter((t) => t.material_type_id !== id),
        loading: true,
      };
    });
    try {
      await deleteMaterialType(id);
    } catch (e) {
      if (prev) set({ types: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createColourType: async (input) => {
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    set((s) => ({
      colourTypes: [
        ...s.colourTypes,
        {
          colour_type_id: tempId,
          description: input.description,
          created_at: nowIso,
        },
      ],
      colourTypeMaterials: [
        ...s.colourTypeMaterials,
        ...input.material_type_ids.map((materialTypeId) => ({
          colour_type_id: tempId,
          material_type_id: materialTypeId,
          created_at: nowIso,
        })),
      ],
      loading: true,
    }));
    try {
      const created = await insertColourType(input);
      set((s) => ({
        colourTypes: s.colourTypes.map((item) =>
          item.colour_type_id === tempId ? created : item,
        ),
        colourTypeMaterials: s.colourTypeMaterials.map((row) =>
          row.colour_type_id === tempId
            ? { ...row, colour_type_id: created.colour_type_id }
            : row,
        ),
      }));
      return created;
    } catch (e) {
      // rollback: drop the temporary colour type and its material links
      set((s) => ({
        colourTypes: s.colourTypes.filter(
          (item) => item.colour_type_id !== tempId,
        ),
        colourTypeMaterials: s.colourTypeMaterials.filter(
          (row) => row.colour_type_id !== tempId,
        ),
      }));
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateColourType: async (id, input) => {
    let prevColourTypes: ColourType[] | undefined;
    let prevColourTypeMaterials: ColourTypeMaterialType[] | undefined;
    set((s) => {
      prevColourTypes = s.colourTypes;
      prevColourTypeMaterials = s.colourTypeMaterials;
      const colourTypes = s.colourTypes.map((item) =>
        item.colour_type_id === id
          ? {
              ...item,
              description:
                input.description !== undefined && input.description !== null
                  ? input.description
                  : item.description,
            }
          : item,
      );
      // Mirrors what `replaceColourTypeMaterials` does server-side: swap
      // this colour type's material links for the new set, in one pass.
      const colourTypeMaterials =
        input.material_type_ids === undefined
          ? s.colourTypeMaterials
          : [
              ...s.colourTypeMaterials.filter(
                (row) => row.colour_type_id !== id,
              ),
              ...input.material_type_ids.map((materialTypeId) => ({
                colour_type_id: id,
                material_type_id: materialTypeId,
                created_at: new Date().toISOString(),
              })),
            ];
      return { colourTypes, colourTypeMaterials, loading: true };
    });
    try {
      await patchColourType(id, input);
    } catch (e) {
      if (prevColourTypes) set({ colourTypes: prevColourTypes });
      if (prevColourTypeMaterials) {
        set({ colourTypeMaterials: prevColourTypeMaterials });
      }
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteColourType: async (id: string) => {
    let prevColourTypes: ColourType[] | undefined;
    let prevColourTypeMaterials: ColourTypeMaterialType[] | undefined;
    set((s) => {
      prevColourTypes = s.colourTypes;
      prevColourTypeMaterials = s.colourTypeMaterials;
      return {
        colourTypes: s.colourTypes.filter(
          (item) => item.colour_type_id !== id,
        ),
        colourTypeMaterials: s.colourTypeMaterials.filter(
          (row) => row.colour_type_id !== id,
        ),
        loading: true,
      };
    });
    try {
      await removeColourType(id);
    } catch (e) {
      if (prevColourTypes) set({ colourTypes: prevColourTypes });
      if (prevColourTypeMaterials) {
        set({ colourTypeMaterials: prevColourTypeMaterials });
      }
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createStock: async (input) => {
    // optimistic add
    const tempId = `temp-${Date.now()}`;
    set((s) => ({
      stock: [
        ...s.stock,
        {
          material_stock_id: tempId,
          colour_name: input.colour_name,
          colour: input.colour ?? colourFromName(input.colour_name),
          comment: null,
          colour_type_id: input.colour_type_id,
          colour_brand_id: input.colour_brand_id ?? null,
          quantity_in_stock: input.quantity_in_stock ?? 0,
          is_active: input.is_active === false ? 0 : 1,
          created_at: new Date().toISOString(),
          updated_at: null,
        },
      ],
      loading: true,
    }));
    try {
      const created = await createMaterialStock(input);
      set((s) => ({
        stock: s.stock.map((st) =>
          st.material_stock_id === tempId ? created : st,
        ),
      }));
      return created;
    } catch (e) {
      set((s) => ({
        stock: s.stock.filter((st) => st.material_stock_id !== tempId),
      }));
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async (id, input) => {
    // optimistic update
    let prev: MaterialStock[] | undefined;
    set((s) => {
      prev = s.stock;
      return {
        stock: s.stock.map((st) =>
          st.material_stock_id === id
            ? {
                ...st,
                ...input,
                is_active:
                  input.is_active === undefined
                    ? st.is_active
                    : input.is_active
                      ? 1
                      : 0,
              }
            : st,
        ),
        loading: true,
      };
    });
    try {
      await updateMaterialStock(id, input);
    } catch (e) {
      if (prev) set({ stock: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteStock: async (id: string) => {
    // optimistic delete
    let prev: MaterialStock[] | undefined;
    set((s) => {
      prev = s.stock;
      return {
        stock: s.stock.filter((st) => st.material_stock_id !== id),
        loading: true,
      };
    });
    try {
      await deleteMaterialStock(id);
    } catch (e) {
      if (prev) set({ stock: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useInventoryStore;
