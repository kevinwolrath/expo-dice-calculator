import type { MaterialStock, MaterialType } from "@/db";
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

type InventoryState = {
  types: MaterialType[];
  stock: MaterialStock[];
  loading: boolean;

  loadAll: () => Promise<void>;
  loadTypes: () => Promise<void>;
  loadStock: () => Promise<void>;

  createType: (input: { description: string }) => Promise<void>;
  updateType: (
    id: number,
    input: { description?: string | null },
  ) => Promise<void>;
  deleteType: (id: number) => Promise<void>;

  createStock: (input: {
    colour_name: string;
    material_type_id: number;
    quantity_in_stock?: number;
  }) => Promise<void>;
  updateStock: (
    id: number,
    input: {
      colour_name?: string;
      material_type_id?: number;
      quantity_in_stock?: number;
    },
  ) => Promise<void>;
  deleteStock: (id: number) => Promise<void>;
};

export const useInventoryStore = create<InventoryState>((set: any) => ({
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

  createType: async (input: { description: string }) => {
    // optimistic: add a temporary type immediately
    const tempId = -Date.now();
    set((s: any) => ({
      types: [
        ...s.types,
        {
          material_type_id: tempId,
          description: input.description,
          created_at: new Date().toISOString(),
        } as MaterialType,
      ],
      loading: true,
    }));
    try {
      await createMaterialType(input);
      const types = await listMaterialTypes();
      set({ types });
    } catch (e) {
      // rollback by reloading
      const types = await listMaterialTypes();
      set({ types });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateType: async (id: number, input: { description?: string | null }) => {
    // optimistic update
    const prev = (await listMaterialTypes()).map((t: any) => ({ ...t }));
    set((s: any) => ({
      types: s.types.map((t: any) =>
        t.material_type_id === id
          ? {
              ...t,
              description:
                input.description !== undefined
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
    const prev = (await listMaterialTypes()).map((t: any) => ({ ...t }));
    set((s: any) => ({
      types: s.types.filter((t: any) => t.material_type_id !== id),
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

  createStock: async (input: {
    colour_name: string;
    material_type_id: number;
    quantity_in_stock?: number;
  }) => {
    // optimistic add
    const tempId = -Date.now();
    set((s: any) => ({
      stock: [
        ...s.stock,
        {
          material_stock_id: tempId,
          colour_name: input.colour_name,
          material_type_id: input.material_type_id,
          quantity_in_stock: input.quantity_in_stock ?? 0,
          is_active: 1,
          created_at: new Date().toISOString(),
        } as MaterialStock,
      ],
      loading: true,
    }));
    try {
      await createMaterialStock(input);
      const stock = await listMaterialStock();
      set({ stock });
    } catch (e) {
      const stock = await listMaterialStock();
      set({ stock });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async (
    id: number,
    input: {
      colour_name?: string;
      material_type_id?: number;
      quantity_in_stock?: number;
    },
  ) => {
    // optimistic update
    const prev = (await listMaterialStock()).map((s: any) => ({ ...s }));
    set((s: any) => ({
      stock: s.stock.map((st: any) =>
        st.material_stock_id === id ? { ...st, ...input } : st,
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
    const prev = (await listMaterialStock()).map((s: any) => ({ ...s }));
    set((s: any) => ({
      stock: s.stock.filter((st: any) => st.material_stock_id !== id),
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
