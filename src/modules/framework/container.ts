import "reflect-metadata";
import { Container } from "inversify";
import { CoreController } from "../core/core.controller";
import { CoreService } from "../core/core.service";

const container = new Container();
container.bind(CoreController).toSelf();
container.bind(CoreService).toSelf();

export const getContainer = () => {
  return container;
};
