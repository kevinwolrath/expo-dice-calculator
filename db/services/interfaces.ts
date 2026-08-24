import type {
    DiceJob,
    DiceJobColour,
    DiceJobNumberColour,
    MaterialStock,
    MaterialType,
    ProductionMethod,
    ProductionMethodMaterial,
} from "../types";

export interface MaterialTypeService {
  listMaterialTypes(): Promise<MaterialType[]>;
  getMaterialType(id: number): Promise<MaterialType | null>;
  createMaterialType(input: { description: string }): Promise<MaterialType>;
  updateMaterialType(
    id: number,
    input: { description?: string | null },
  ): Promise<void>;
  deleteMaterialType(id: number): Promise<void>;
}

export interface ProductionMethodService {
  listProductionMethods(): Promise<ProductionMethod[]>;
  getProductionMethod(id: number): Promise<ProductionMethod | null>;
  createProductionMethod(input: {
    description: string;
  }): Promise<ProductionMethod>;
  updateProductionMethod(
    id: number,
    input: { description?: string | null },
  ): Promise<void>;
  deleteProductionMethod(id: number): Promise<void>;
}

export interface MaterialStockService {
  listMaterialStock(): Promise<MaterialStock[]>;
  getMaterialStock(id: number): Promise<MaterialStock | null>;
  createMaterialStock(input: {
    colour_name: string;
    material_type_id: number;
    quantity_in_stock?: number;
    is_active?: boolean;
  }): Promise<MaterialStock>;
  updateMaterialStock(
    id: number,
    input: {
      colour_name?: string;
      material_type_id?: number;
      quantity_in_stock?: number;
      is_active?: boolean;
    },
  ): Promise<void>;
  deleteMaterialStock(id: number): Promise<void>;
}

export interface DiceJobService {
  listDiceJobs(): Promise<DiceJob[]>;
  getDiceJob(id: number): Promise<DiceJob | null>;
  createDiceJob(input: {
    job_name: string;
    description?: string | null;
    job_date: string;
    colour_count: number;
    production_method_id: number;
    dice_job_number_colour_id: number;
  }): Promise<DiceJob>;
  updateDiceJob(
    id: number,
    input: {
      job_name?: string;
      description?: string | null;
      job_date?: string;
      colour_count?: number;
      production_method_id?: number;
      dice_job_number_colour_id?: number;
    },
  ): Promise<void>;
  deleteDiceJob(id: number): Promise<void>;
}

export interface DiceJobColourService {
  listDiceJobColours(diceJobId: number): Promise<DiceJobColour[]>;
  listAllDiceJobColours(): Promise<DiceJobColour[]>;
  getDiceJobColour(id: number): Promise<DiceJobColour | null>;
  createDiceJobColour(input: {
    dice_job_id: number;
    material_stock_id: number;
    colour_order?: number | null;
  }): Promise<DiceJobColour>;
  updateDiceJobColour(
    id: number,
    input: { material_stock_id?: number; colour_order?: number | null },
  ): Promise<void>;
  deleteDiceJobColour(id: number): Promise<void>;
  replaceDiceJobColours(
    diceJobId: number,
    materialStockIds: number[],
  ): Promise<DiceJobColour[]>;
}

export interface DiceJobNumberColourService {
  listDiceJobNumberColours(): Promise<DiceJobNumberColour[]>;
  getDiceJobNumberColour(id: number): Promise<DiceJobNumberColour | null>;
  createDiceJobNumberColour(input: {
    dice_job_number_colour_name: string;
  }): Promise<DiceJobNumberColour>;
  updateDiceJobNumberColour(
    id: number,
    input: { dice_job_number_colour_name?: string },
  ): Promise<void>;
  deleteDiceJobNumberColour(id: number): Promise<void>;
}

export interface ProductionMethodMaterialService {
  listAllowedMaterialsForMethod(
    productionMethodId: number,
  ): Promise<ProductionMethodMaterial[]>;
  listAllAllowedMaterials(): Promise<ProductionMethodMaterial[]>;
  addAllowedMaterial(
    productionMethodId: number,
    materialTypeId: number,
  ): Promise<void>;
  removeAllowedMaterial(
    productionMethodId: number,
    materialTypeId: number,
  ): Promise<void>;
}

export type DBServices =
  | MaterialTypeService
  | ProductionMethodService
  | MaterialStockService
  | DiceJobService
  | DiceJobColourService
  | DiceJobNumberColourService
  | ProductionMethodMaterialService;
