import winston from "winston";
import { ILogger } from "../domain/ports/logger.interface";
import { inject, injectable } from "inversify";
import {
  Environment,
  IConfig,
  I_CONFIG,
} from "../domain/ports/config.interface";

@injectable()
export class SystemLogger implements ILogger {
  private logger: winston.Logger;

  constructor(@inject(I_CONFIG) private readonly config: IConfig) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
      ),
      transports: [
        new winston.transports.Console({
          silent: config.getEnvironment() === Environment.Test,
        }),
      ],
    });
  }

  getWinston() {
    return this.logger;
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }
}
