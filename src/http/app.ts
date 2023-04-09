import express from "express";
import expressWinston from "express-winston";
import { getContainer, getLogger } from "../framework/container";
import { InversifyExpressServer } from "inversify-express-utils";
import { SystemLogger } from "../modules/core/infra/system.logger";

import "../modules/core/domain/app/core.controller";
import "../modules/user/domain/app/auth.controller";
import { AppException } from "../shared/errors";

const server = new InversifyExpressServer(getContainer());
server
  .setConfig((app) => {
    app.use(
      expressWinston.logger({
        winstonInstance: (getLogger() as SystemLogger).getWinston(),
      })
    );
    app.use(express.json());
  })
  .setErrorConfig((app) => {
    app.use(errorHandler);
  });

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

export const app = server.build();
