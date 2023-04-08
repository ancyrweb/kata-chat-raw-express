import { CoreService } from "./core.service";
import { controller, httpGet, interfaces } from "inversify-express-utils";

@controller("/")
export class CoreController implements interfaces.Controller {
  constructor(private readonly coreService: CoreService) {}

  @httpGet("/")
  async getIndex() {
    return this.coreService.getIndex();
  }
}
