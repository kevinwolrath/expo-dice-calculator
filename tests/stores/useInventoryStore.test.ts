jest.mock("@/db", () => require("../__mocks__/dbMock"));

import useInventoryStore from "@/stores/useInventoryStore";
import dbMock from "../__mocks__/dbMock";

beforeEach(() => {
  jest.clearAllMocks();
  // reset store state
  useInventoryStore.setState({ types: [], stock: [], loading: false });
});

test("loadAll loads types and stock from DB", async () => {
  await useInventoryStore.getState().loadAll();
  const state = useInventoryStore.getState();
  expect(state.types.length).toBeGreaterThan(0);
  expect(state.stock.length).toBeGreaterThan(0);
  expect(dbMock.initDatabase).toHaveBeenCalled();
});

test("createType appends a new type", async () => {
  // simulate that after creating, listMaterialTypes returns two types
  (dbMock.listMaterialTypes as jest.Mock).mockResolvedValueOnce([
    {
      material_type_id: 1,
      description: "Type A",
      created_at: new Date().toISOString(),
    },
    {
      material_type_id: 2,
      description: "Type B",
      created_at: new Date().toISOString(),
    },
  ]);

  await useInventoryStore.getState().createType({ description: "Type B" });
  const state = useInventoryStore.getState();
  expect(
    state.types.find((t: any) => t.description === "Type B"),
  ).toBeDefined();
  expect(dbMock.createMaterialType).toHaveBeenCalledWith({
    description: "Type B",
  });
});

test("createStock appends a new stock item", async () => {
  (dbMock.listMaterialStock as jest.Mock).mockResolvedValueOnce([
    {
      material_stock_id: 1,
      colour_name: "Red",
      material_type_id: 1,
      quantity_in_stock: 5,
      is_active: 1,
      created_at: new Date().toISOString(),
    },
    {
      material_stock_id: 2,
      colour_name: "Blue",
      material_type_id: 1,
      quantity_in_stock: 2,
      is_active: 1,
      created_at: new Date().toISOString(),
    },
  ]);

  await useInventoryStore.getState().createStock({
    colour_name: "Blue",
    material_type_id: 1,
    quantity_in_stock: 2,
  });
  const state = useInventoryStore.getState();
  expect(state.stock.find((s: any) => s.colour_name === "Blue")).toBeDefined();
  expect(dbMock.createMaterialStock).toHaveBeenCalled();
});
