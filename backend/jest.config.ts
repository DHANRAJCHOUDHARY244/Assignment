import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "/src/routes/",
    "/src/config/",
    "/src/constants/",
    "/src/types/",
    "/src/app.ts",
    "/src/server.ts",
    "/src/controllers/HealthController.ts",
    "/src/middleware/errorHandler.ts",
    "/src/helpers/logger.ts",
    "/src/utils/response.ts",
  ],
};

export default config;
