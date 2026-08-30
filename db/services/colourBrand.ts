import { getDatabase } from "../client";
import type { ColourBrand } from "../types";

export const listColourBrands = async (): Promise<ColourBrand[]> => {
  const db = await getDatabase();
  return db.getAllAsync<ColourBrand>(
    "SELECT colour_brand_id, colour_brand_name, created_at FROM colour_brand ORDER BY colour_brand_name;",
  );
};

export const getColourBrand = async (
  id: string,
): Promise<ColourBrand | null> => {
  const db = await getDatabase();
  return db.getFirstAsync<ColourBrand>(
    "SELECT colour_brand_id, colour_brand_name, created_at FROM colour_brand WHERE colour_brand_id = ?;",
    id,
  );
};
