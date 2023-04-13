import { Container } from "inversify";
import express from "express";
import expressWinston from "express-winston";
import * as http from "http";

import { InversifyExpressServer } from "inversify-express-utils";
import { SystemLogger } from "../modules/core/infra/adapters/system.logger";
import { AppException } from "../shared/errors";
import {
  ILogger,
  I_LOGGER,
} from "../modules/core/domain/ports/logger.interface";
import { AuthProvider } from "../modules/user/infra/auth-provider";
import { OrNull } from "../types";

export const I_HTTP_SERVER = Symbol("I_HTTP_SERVER");

export abstract class BaseKernel {
  protected container: Container;
  protected http!: express.Application;
  protected server!: http.Server;

  private stopSignal: OrNull<string> = null;

  constructor() {
    this.container = new Container();
  }

  public abstract inject(container: Container): void;

  protected async onApplicationStart(): Promise<void> {
    return;
  }

  protected async onApplicationShutdown(signal: OrNull<string>): Promise<void> {
    return;
  }

  protected async afterApplicationShutdown(): Promise<void> {
    return;
  }

  async setup() {
    this.inject(this.container);

    this.http = new InversifyExpressServer(
      this.container,
      null,
      null,
      null,
      // @ts-ignore
      AuthProvider
    )
      .setConfig((app) => {
        app.use(
          expressWinston.logger({
            winstonInstance: this.container
              .get<SystemLogger>(I_LOGGER)
              .getWinston(),
          })
        );
        app.use(express.json());
      })
      .setErrorConfig((app) => {
        app.use(errorHandler);
      })
      .build();

    this.server = http.createServer(this.http);
  }

  start() {
    this.listen(3000, () => {
      const logger = this.container.get<ILogger>(I_LOGGER);
      logger.info("Server started on port 3000");

      // Lifecycle hooks
      this.onApplicationStart();
    });
  }

  getContainer() {
    return this.container;
  }

  listen(callback: () => void): void;
  listen(port: number, callback: () => void): void;
  listen(port: any, callback?: () => void): void {
    callback = callback ?? port;

    if (!callback) {
      this.server = this.http.listen(callback);
    } else {
      this.server = this.http.listen(port, callback);
    }

    this.container.bind(I_HTTP_SERVER).toConstantValue(this.server);

    this.server.on("close", async () => {
      await this.afterApplicationShutdown();
    });

    // Graceful Shutdowns
    process.on("SIGTERM", () => {
      this.stopSignal = "SIGTERM";
      this.stop();
    });

    process.on("SIGINT", () => {
      this.stopSignal = "SIGINT";
      this.stop();
    });
  }

  stop() {
    this.server.close();
    this.onApplicationShutdown(this.stopSignal);
  }

  getHttp() {
    return this.http;
  }

  getServer() {
    return this.server;
  }
}

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  let status = 500;
  let message = "Internal server error";
  let code = null;

  if (err instanceof AppException) {
    status = err.statusCode;
    message = err.message;
    code = err.code;
  }

  res.status(status).send({
    status,
    message,
    code,
  });
};
