export const I_CONFIG = Symbol("I_CONFIG");

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export interface IConfig {
  getEnvironment(): Environment;
}
