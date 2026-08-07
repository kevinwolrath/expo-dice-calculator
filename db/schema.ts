// Database schema, kept isolated so it can be updated independently of the
// code that opens/migrates the database. Bump DATABASE_VERSION in `client.ts`
// whenever this schema changes and needs to be migrated on existing installs.
export const DATABASE_SCHEMA = `
PRAGMA foreign_keys = ON;

-------------------------------------------------------------
-- Material Types
-------------------------------------------------------------

CREATE TABLE material_type
(
    material_type_id INTEGER PRIMARY KEY AUTOINCREMENT,

    description TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------
-- Production Methods
-------------------------------------------------------------

CREATE TABLE production_method
(
    production_method_id INTEGER PRIMARY KEY AUTOINCREMENT,

    description TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------
-- Material Stock
-------------------------------------------------------------

CREATE TABLE material_stock
(
    material_stock_id INTEGER PRIMARY KEY AUTOINCREMENT,

    colour_name TEXT NOT NULL,

    material_type_id INTEGER NOT NULL,

    quantity_in_stock INTEGER NOT NULL DEFAULT 0,

    is_active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    FOREIGN KEY (material_type_id)
        REFERENCES material_type(material_type_id),

    CHECK (quantity_in_stock >= 0)
);

CREATE INDEX ix_material_stock_material_type
ON material_stock(material_type_id);

-------------------------------------------------------------
-- Jobs
-------------------------------------------------------------

CREATE TABLE dice_job
(
    dice_job_id INTEGER PRIMARY KEY AUTOINCREMENT,

    job_name TEXT NOT NULL,

    description TEXT,

    job_date TEXT NOT NULL,

    colour_count INTEGER NOT NULL,

    production_method_id INTEGER NOT NULL,

    primary_material_stock_id INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT,

    FOREIGN KEY (production_method_id)
        REFERENCES production_method(production_method_id),

    FOREIGN KEY (primary_material_stock_id)
        REFERENCES material_stock(material_stock_id),

    CHECK (colour_count > 0)
);

CREATE INDEX ix_dice_job_method
ON dice_job(production_method_id);

CREATE INDEX ix_dice_job_material
ON dice_job(primary_material_stock_id);

-------------------------------------------------------------
-- Job Colours
-------------------------------------------------------------

CREATE TABLE dice_job_colour
(
    dice_job_colour_id INTEGER PRIMARY KEY AUTOINCREMENT,

    dice_job_id INTEGER NOT NULL,

    material_stock_id INTEGER NOT NULL,

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
-- Allowed Materials for a Production Method
-------------------------------------------------------------

CREATE TABLE production_method_material
(
    production_method_id INTEGER NOT NULL,

    material_type_id INTEGER NOT NULL,

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
