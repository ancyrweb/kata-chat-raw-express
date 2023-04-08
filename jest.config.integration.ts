/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  collectCoverage: false,
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "\\.integration\\.test\\.ts$",
  maxWorkers: 1,
};
