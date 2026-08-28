import type {
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
    listMaterialStock,
    listMaterialTypes,
    updateMaterialStock,
    updateMaterialType,
} from "@/db";
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

type InventoryState = {
  types: MaterialType[];
  stock: MaterialStock[];
  loading: boolean;

  loadAll: () => Promise<void>;
  loadTypes: () => Promise<void>;
  loadStock: () => Promise<void>;

  createType: (input: CreateMaterialTypeInput) => Promise<MaterialType>;
  updateType: (id: number, input: UpdateMaterialTypeInput) => Promise<void>;
  deleteType: (id: number) => Promise<void>;

  createStock: (input: CreateMaterialStockInput) => Promise<MaterialStock>;
  updateStock: (id: number, input: UpdateMaterialStockInput) => Promise<void>;
  deleteStock: (id: number) => Promise<void>;
};

export const useInventoryStore = create<InventoryState>((set) => ({
  types: [],
  stock: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      await initDatabase();
      const [types, stock] = await Promise.all([
        listMaterialTypes(),
        listMaterialStock(),
      ]);
      set({ types, stock });
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
    // optimistic: add a temporary type immediately
    const tempId = -Date.now();
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
      const types = await listMaterialTypes();
      set({ types });
      return created;
    } catch (e) {
      // rollback by reloading
      const types = await listMaterialTypes();
      set({ types });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateType: async (id, input) => {
    // optimistic update
    const prev = await listMaterialTypes();
    set((s) => ({
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
    }));
    try {
      await updateMaterialType(id, input);
      const types = await listMaterialTypes();
      set({ types });
    } catch (e) {
      // rollback
      set({ types: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteType: async (id: number) => {
    // optimistic delete
    const prev = await listMaterialTypes();
    set((s) => ({
      types: s.types.filter((t) => t.material_type_id !== id),
      loading: true,
    }));
    try {
      await deleteMaterialType(id);
      const types = await listMaterialTypes();
      set({ types });
    } catch (e) {
      // rollback
      set({ types: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createStock: async (input) => {
    // optimistic add
    const tempId = -Date.now();
    set((s) => ({
      stock: [
        ...s.stock,
        {
          material_stock_id: tempId,
          colour_name: input.colour_name,
          material_type_id: input.material_type_id,
          colour_type_id: input.colour_type_id ?? 0,
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
      const stock = await listMaterialStock();
      set({ stock });
      return created;
    } catch (e) {
      const stock = await listMaterialStock();
      set({ stock });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async (id, input) => {
    // optimistic update
    const prev = await listMaterialStock();
    set((s) => ({
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
    }));
    try {
      await updateMaterialStock(id, input);
      const stock = await listMaterialStock();
      set({ stock });
    } catch (e) {
      set({ stock: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteStock: async (id: number) => {
    // optimistic delete
    const prev = await listMaterialStock();
    set((s) => ({
      stock: s.stock.filter((st) => st.material_stock_id !== id),
      loading: true,
    }));
    try {
      await deleteMaterialStock(id);
      const stock = await listMaterialStock();
      set({ stock });
    } catch (e) {
      set({ stock: prev });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useInventoryStore;
