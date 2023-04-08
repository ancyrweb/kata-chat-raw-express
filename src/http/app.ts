import express from "express";
import { getContainer } from "../framework/container";
import { InversifyExpressServer } from "inversify-express-utils";

import "../modules/core/domain/app/core.controller";
import "../modules/user/domain/app/auth.controller";

const server = new InversifyExpressServer(getContainer());
server.setConfig((app) => {
  app.use(express.json());
});

export const app = server.build();
