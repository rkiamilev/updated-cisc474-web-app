"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestConfig = void 0;
const base_1 = require("./base");
exports.nestConfig = {
    ...base_1.config,
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};
