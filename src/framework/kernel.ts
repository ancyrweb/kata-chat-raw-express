import { Container } from "inversify";
import express from "express";
import expressWinston from "express-winston";

import { InversifyExpressServer } from "inversify-express-utils";
import { SystemLogger } from "../modules/core/infra/system.logger";
import { AppException } from "../shared/errors";
import {
  ILogger,
  I_LOGGER,
} from "../modules/core/domain/ports/logger.interface";

export abstract class BaseKernel {
  protected container: Container;
  protected http!: express.Application;

  constructor() {
    this.container = new Container();
  }

  public abstract inject(container: Container): void;

  async setup() {
    this.inject(this.container);
    this.http = new InversifyExpressServer(this.container)
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
  }

  async start() {
    this.http.listen(3000, () => {
      const logger = this.container.get<ILogger>(I_LOGGER);
      logger.info("Server started on port 3000");
    });
  }

  getContainer() {
    return this.container;
  }

  getHttp() {
    return this.http;
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
