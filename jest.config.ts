import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // Mapping alias @/* → src/* sesuai tsconfig.json
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Pastikan path alias di-resolve oleh ts-jest
          paths: { "@/*": ["./src/*"] },
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
};

export default config;
