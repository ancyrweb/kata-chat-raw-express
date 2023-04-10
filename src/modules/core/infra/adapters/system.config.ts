import { injectable } from "inversify";
import * as path from "path";
import { Environment, IConfig } from "../../domain/ports/config.interface";

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

  getVarDirectory(): string {
    return path.resolve(__dirname, "..", "..", "..", "..", "var");
  }

  getFSDBDirectory(): string {
    return path.resolve(
      this.getVarDirectory(),
      this.getEnvironment() === Environment.Test ? "fsdb-test" : "fsdb"
    );
  }

  getSecret(): string {
    return "this is super secret";
  }

  getAccessTokenValidityTime(): number {
    return 60 * 60 * 1; // 1 hour
  }
}
