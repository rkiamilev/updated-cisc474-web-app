"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_1 = __importDefault(require("next/jest"));
const base_1 = require("./base");
const createJestConfig = (0, jest_1.default)({
    dir: './',
});
const config = {
    ...base_1.config,
    moduleFileExtensions: [...base_1.config.moduleFileExtensions, 'jsx', 'tsx'],
};
const nextConfig = createJestConfig(config);
exports.default = nextConfig;
