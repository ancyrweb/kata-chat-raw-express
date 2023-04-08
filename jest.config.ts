/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  collectCoverage: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "^((?!integration).)*.test.ts$",
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  setupFiles: ["./src/testing/jest.setup.ts"],
};
