export type MaterialType = {
  material_type_id: string;
  description: string;
  created_at: string;
};

export type ProductionMethod = {
  production_method_id: string;
  description: string;
  minimum_colour_count: number | null;
  maximum_colour_count: number | null;
  created_at: string;
};

export type MaterialStock = {
  material_stock_id: string;
  colour_name: string;
  comment: string | null;
  colour_type_id: string;
  colour_brand_id: string | null;
  quantity_in_stock: number;
  is_active: number;
  created_at: string;
  updated_at: string | null;
};

export type ColourType = {
  colour_type_id: string;
  description: string;
  created_at: string;
};

export type ColourTypeMaterialType = {
  colour_type_id: string;
  material_type_id: string;
  created_at: string;
};

export type ColourBrand = {
  colour_brand_id: string;
  colour_brand_name: string;
  created_at: string;
};

export type DiceJob = {
  dice_job_id: string;
  job_name: string;
  description: string | null;
  colour_count: number;
  colour_count_manual: number;
  material_type_id: string;
  material_type_manual: number;
  production_method_id: string;
  production_method_manual: number;
  dice_job_number_colour_id: string;
  created_at: string;
  updated_at: string | null;
};

export type DiceJobColour = {
  dice_job_colour_id: string;
  dice_job_id: string;
  material_stock_id: string;
  colour_order: number | null;
  created_at: string;
};

export type DiceJobNumberColour = {
  dice_job_number_colour_id: string;
  dice_job_number_colour_name: string;
  created_at: string;
};

export type ProductionMethodMaterial = {
  production_method_id: string;
  material_type_id: string;
  created_at: string;
};

export type DiceJobColourTypeExclusion = {
  dice_job_colour_type_exclusion_id: string;
  dice_job_id: string;
  colour_type_id: string;
};
