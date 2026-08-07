export type MaterialType = {
  material_type_id: number;
  description: string;
  created_at: string;
};

export type ProductionMethod = {
  production_method_id: number;
  description: string;
  created_at: string;
};

export type MaterialStock = {
  material_stock_id: number;
  colour_name: string;
  material_type_id: number;
  quantity_in_stock: number;
  is_active: number;
  created_at: string;
  updated_at: string | null;
};

export type DiceJob = {
  dice_job_id: number;
  job_name: string;
  description: string | null;
  job_date: string;
  colour_count: number;
  production_method_id: number;
  primary_material_stock_id: number | null;
  created_at: string;
  updated_at: string | null;
};

export type DiceJobColour = {
  dice_job_colour_id: number;
  dice_job_id: number;
  material_stock_id: number;
  colour_order: number | null;
  created_at: string;
};

export type ProductionMethodMaterial = {
  production_method_id: number;
  material_type_id: number;
  created_at: string;
};
