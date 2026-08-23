const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Cho Metro xử lý file WebAssembly (.wasm) như asset
config.resolver.assetExts.push("wasm");

module.exports = config;