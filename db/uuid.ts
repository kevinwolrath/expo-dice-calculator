import * as Crypto from "expo-crypto";

// Central place to generate primary key values so every table uses the same UUID format.
export const generateId = (): string => Crypto.randomUUID();
