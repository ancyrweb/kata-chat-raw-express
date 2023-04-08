import { injectable } from "inversify";
import { CoreService } from "./core.service";
import { controller, httpGet } from "inversify-express-utils";

@controller("/")
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @httpGet("/")
  async getIndex() {
    return this.coreService.getIndex();
  }
}
