import { injectable } from "inversify";
import { Environment, IConfig } from "../domain/ports/config.interface";

@injectable()
export class SystemConfig implements IConfig {
  getEnvironment(): Environment {
    if (process.env.NODE_ENV === "production") {
      return Environment.Production;
    } else if (process.env.NODE_ENV === "test") {
      return Environment.Test;
    } else {
      return Environment.Development;
    }
  }
}
