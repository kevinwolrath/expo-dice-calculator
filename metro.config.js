const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Add wasm to asset extensions
config.resolver.assetExts.push("wasm");

// expo-sqlite web uses SharedArrayBuffer-backed WASM storage.
config.server = {
  ...config.server,
  headers: {
    ...config.server?.headers,
    "Cross-Origin-Embedder-Policy": "credentialless",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
};

module.exports = config;
