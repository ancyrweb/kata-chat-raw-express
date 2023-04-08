import express from "express";
import { getContainer } from "../modules/framework/container";
import { CoreController } from "../modules/core/core.controller";

export const app = express();

app.get("/", async (req, res) => {
  const result = await getContainer().get(CoreController).getIndex();

  res.send(result);
});
