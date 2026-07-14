import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  extensionsToTreatAsEsm: [".ts"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
