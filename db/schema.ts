// Database schema, kept isolated so it can be updated independently of the
// code that opens/migrates the database. Bump DATABASE_VERSION in `client.ts`
// whenever this schema changes and needs to be migrated on existing installs.
export const DATABASE_SCHEMA = `
-------------------------------------------------------------
-- Material Types
-------------------------------------------------------------

CREATE TABLE material_type
(
    material_type_id TEXT PRIMARY KEY,

    description TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------
-- Production Methods
-------------------------------------------------------------

CREATE TABLE production_method
(
    production_method_id TEXT PRIMARY KEY,

    description TEXT NOT NULL UNIQUE,

    minimum_colour_count INTEGER,

    maximum_colour_count INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------
-- Colour Type
-------------------------------------------------------------

CREATE TABLE colour_type
(
    colour_type_id TEXT PRIMARY KEY,

    description TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_colour_type
ON colour_type(colour_type_id);

-------------------------------------------------------------
-- Colour Type allowed Material Types
-------------------------------------------------------------

CREATE TABLE colour_type_material_type
(
    colour_type_id TEXT NOT NULL,

    material_type_id TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY
    (
        colour_type_id,
        material_type_id
    ),

    FOREIGN KEY (colour_type_id)
        REFERENCES colour_type(colour_type_id)
        ON DELETE CASCADE,

    FOREIGN KEY (material_type_id)
        REFERENCES material_type(material_type_id)
        ON DELETE CASCADE
);

CREATE INDEX ix_colour_type_material_type_material
ON colour_type_material_type(material_type_id);

-------------------------------------------------------------
-- Colour Brand
-------------------------------------------------------------

CREATE TABLE colour_brand
(
    colour_brand_id TEXT PRIMARY KEY,

    colour_brand_name TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_colour_brand
ON colour_brand(colour_brand_id);

-------------------------------------------------------------
-- Material Stock
-------------------------------------------------------------

CREATE TABLE material_stock
(
    material_stock_id TEXT PRIMARY KEY,

    colour_name TEXT NOT NULL,

    colour TEXT NOT NULL,

    comment TEXT,

    colour_type_id TEXT NOT NULL,

    colour_brand_id TEXT,

    quantity_in_stock INTEGER NOT NULL DEFAULT 0,

    is_active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    FOREIGN KEY (colour_type_id)
        REFERENCES colour_type(colour_type_id),

    FOREIGN KEY (colour_brand_id)
        REFERENCES colour_brand(colour_brand_id),

    CHECK (quantity_in_stock >= 0)
);

CREATE INDEX ix_material_stock_colour_type
ON material_stock(colour_type_id);

-------------------------------------------------------------
-- Job Number Colours
-------------------------------------------------------------

CREATE TABLE dice_job_number_colour
(
    dice_job_number_colour_id TEXT PRIMARY KEY,

    dice_job_number_colour_name TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------
-- Jobs
-------------------------------------------------------------

CREATE TABLE dice_job
(
    dice_job_id TEXT PRIMARY KEY,

    job_name TEXT NOT NULL,

    description TEXT,

    colour_count INTEGER NOT NULL,

    colour_count_manual INTEGER NOT NULL DEFAULT 0,

    material_type_id TEXT NOT NULL,

    material_type_manual INTEGER NOT NULL DEFAULT 0,

    production_method_id TEXT NOT NULL,

    production_method_manual INTEGER NOT NULL DEFAULT 0,

    dice_job_number_colour_id TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    FOREIGN KEY (material_type_id)
        REFERENCES material_type(material_type_id),

    FOREIGN KEY (production_method_id)
        REFERENCES production_method(production_method_id),

    FOREIGN KEY (dice_job_number_colour_id)
        REFERENCES dice_job_number_colour(dice_job_number_colour_id),

    CHECK (colour_count > 0)
);

CREATE INDEX ix_dice_job_method
ON dice_job(production_method_id);

CREATE INDEX ix_dice_job_number_colour
ON dice_job(dice_job_number_colour_id);

CREATE INDEX ix_dice_job_material_type
ON dice_job(material_type_id);

-------------------------------------------------------------
-- Job Colours
-------------------------------------------------------------

CREATE TABLE dice_job_colour
(
    dice_job_colour_id TEXT PRIMARY KEY,

    dice_job_id TEXT NOT NULL,

    material_stock_id TEXT NOT NULL,

    colour_order INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (dice_job_id)
        REFERENCES dice_job(dice_job_id)
        ON DELETE CASCADE,

    FOREIGN KEY (material_stock_id)
        REFERENCES material_stock(material_stock_id),

    UNIQUE (dice_job_id, material_stock_id)
);

CREATE INDEX ix_job_colour_job
ON dice_job_colour(dice_job_id);

CREATE INDEX ix_job_colour_material
ON dice_job_colour(material_stock_id);


-------------------------------------------------------------
-- Job Colours Type Exclusions
-------------------------------------------------------------

CREATE TABLE dice_job_colour_type_exclusion
(
    dice_job_colour_type_exclusion_id TEXT PRIMARY KEY,

    dice_job_id TEXT NOT NULL,
    
    colour_type_id TEXT NOT NULL,

    FOREIGN KEY (dice_job_id)
        REFERENCES dice_job(dice_job_id)
        ON DELETE CASCADE,

    FOREIGN KEY (colour_type_id)
        REFERENCES colour_type(colour_type_id),

    UNIQUE (dice_job_id, colour_type_id)
);

CREATE INDEX ix_job_colour_type_exclusion_job
ON dice_job_colour_type_exclusion(dice_job_id);

CREATE INDEX ix_job_colour_type_exclusion
ON dice_job_colour_type_exclusion(colour_type_id);

-------------------------------------------------------------
-- Allowed Materials for a Production Method
-------------------------------------------------------------

CREATE TABLE production_method_material
(
    production_method_id TEXT NOT NULL,

    material_type_id TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY
    (
        production_method_id,
        material_type_id
    ),

    FOREIGN KEY (production_method_id)
        REFERENCES production_method(production_method_id)
        ON DELETE CASCADE,

    FOREIGN KEY (material_type_id)
        REFERENCES material_type(material_type_id)
        ON DELETE CASCADE
);

CREATE INDEX ix_method_material_type
ON production_method_material(material_type_id);
`;
