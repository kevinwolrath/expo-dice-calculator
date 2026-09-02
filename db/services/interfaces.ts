import type {
    ColourBrand,
    ColourType,
    ColourTypeMaterialType,
    DiceJob,
    DiceJobColour,
    DiceJobColourTypeExclusion,
    DiceJobNumberColour,
    MaterialStock,
    MaterialType,
    ProductionMethod,
    ProductionMethodMaterial,
} from "../types";

export interface ColourBrandService {
  listColourBrands(): Promise<ColourBrand[]>;
  getColourBrand(id: string): Promise<ColourBrand | null>;
}

export interface ColourTypeService {
  listColourTypes(): Promise<ColourType[]>;
  getColourType(id: string): Promise<ColourType | null>;
  createColourType(input: {
    description: string;
    material_type_ids: string[];
  }): Promise<ColourType>;
  updateColourType(
    id: string,
    input: { description?: string | null; material_type_ids?: string[] },
  ): Promise<void>;
  deleteColourType(id: string): Promise<void>;
}

export interface ColourTypeMaterialTypeService {
  listMaterialsForColourType(
    colourTypeId: string,
  ): Promise<ColourTypeMaterialType[]>;
  listAllColourTypeMaterials(): Promise<ColourTypeMaterialType[]>;
  addColourTypeMaterial(
    colourTypeId: string,
    materialTypeId: string,
  ): Promise<void>;
  removeColourTypeMaterial(
    colourTypeId: string,
    materialTypeId: string,
  ): Promise<void>;
  replaceColourTypeMaterials(
    colourTypeId: string,
    materialTypeIds: string[],
  ): Promise<void>;
}

export interface MaterialTypeService {
  listMaterialTypes(): Promise<MaterialType[]>;
  getMaterialType(id: string): Promise<MaterialType | null>;
  createMaterialType(input: { description: string }): Promise<MaterialType>;
  updateMaterialType(
    id: string,
    input: { description?: string | null },
  ): Promise<void>;
  deleteMaterialType(id: string): Promise<void>;
}

export interface ProductionMethodService {
  listProductionMethods(): Promise<ProductionMethod[]>;
  getProductionMethod(id: string): Promise<ProductionMethod | null>;
  createProductionMethod(input: {
    description: string;
  }): Promise<ProductionMethod>;
  updateProductionMethod(
    id: string,
    input: { description?: string | null },
  ): Promise<void>;
  deleteProductionMethod(id: string): Promise<void>;
}

export interface MaterialStockService {
  listMaterialStock(): Promise<MaterialStock[]>;
  getMaterialStock(id: string): Promise<MaterialStock | null>;
  createMaterialStock(input: {
    colour_name: string;
    colour_type_id: string;
    colour_brand_id?: string | null;
    quantity_in_stock?: number;
    is_active?: boolean;
  }): Promise<MaterialStock>;
  updateMaterialStock(
    id: string,
    input: {
      colour_name?: string;
      colour_type_id?: string;
      colour_brand_id?: string | null;
      quantity_in_stock?: number;
      is_active?: boolean;
    },
  ): Promise<void>;
  deleteMaterialStock(id: string): Promise<void>;
}

export interface DiceJobService {
  listDiceJobs(): Promise<DiceJob[]>;
  getDiceJob(id: string): Promise<DiceJob | null>;
  createDiceJob(input: {
    job_name: string;
    description?: string | null;
    colour_count: number;
    colour_count_manual: number;
    material_type_id: string;
    material_type_manual: number;
    production_method_id: string;
    production_method_manual: number;
    dice_job_number_colour_id: string;
  }): Promise<DiceJob>;
  updateDiceJob(
    id: string,
    input: {
      job_name?: string;
      description?: string | null;
      colour_count?: number;
      colour_count_manual?: number;
      material_type_id?: string;
      material_type_manual?: number;
      production_method_id?: string;
      production_method_manual?: number;
      dice_job_number_colour_id?: string;
    },
  ): Promise<void>;
  deleteDiceJob(id: string): Promise<void>;
}

export interface DiceJobColourService {
  listDiceJobColours(diceJobId: string): Promise<DiceJobColour[]>;
  listAllDiceJobColours(): Promise<DiceJobColour[]>;
  getDiceJobColour(id: string): Promise<DiceJobColour | null>;
  createDiceJobColour(input: {
    dice_job_id: string;
    material_stock_id: string;
    colour_order?: number | null;
  }): Promise<DiceJobColour>;
  updateDiceJobColour(
    id: string,
    input: { material_stock_id?: string; colour_order?: number | null },
  ): Promise<void>;
  deleteDiceJobColour(id: string): Promise<void>;
  replaceDiceJobColours(
    diceJobId: string,
    materialStockIds: string[],
  ): Promise<DiceJobColour[]>;
}

export interface DiceJobColourTypeExclusionService {
  listDiceJobColourTypeExclusions(
    diceJobId: string,
  ): Promise<DiceJobColourTypeExclusion[]>;
  replaceDiceJobColourTypeExclusions(
    diceJobId: string,
    colourTypeIds: string[],
  ): Promise<DiceJobColourTypeExclusion[]>;
}

export interface DiceJobNumberColourService {
  listDiceJobNumberColours(): Promise<DiceJobNumberColour[]>;
  getDiceJobNumberColour(id: string): Promise<DiceJobNumberColour | null>;
  createDiceJobNumberColour(input: {
    dice_job_number_colour_name: string;
  }): Promise<DiceJobNumberColour>;
  updateDiceJobNumberColour(
    id: string,
    input: { dice_job_number_colour_name?: string },
  ): Promise<void>;
  deleteDiceJobNumberColour(id: string): Promise<void>;
}

export interface ProductionMethodMaterialService {
  listAllowedMaterialsForMethod(
    productionMethodId: string,
  ): Promise<ProductionMethodMaterial[]>;
  listAllAllowedMaterials(): Promise<ProductionMethodMaterial[]>;
  addAllowedMaterial(
    productionMethodId: string,
    materialTypeId: string,
  ): Promise<void>;
  removeAllowedMaterial(
    productionMethodId: string,
    materialTypeId: string,
  ): Promise<void>;
}

export type DBServices =
  | ColourBrandService
  | ColourTypeService
  | ColourTypeMaterialTypeService
  | MaterialTypeService
  | ProductionMethodService
  | MaterialStockService
  | DiceJobService
  | DiceJobColourService
  | DiceJobNumberColourService
  | DiceJobColourTypeExclusionService
  | ProductionMethodMaterialService;
