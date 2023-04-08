import { injectable } from "inversify";
import { CoreService } from "./core.service";

@injectable()
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  async getIndex() {
    return this.coreService.getIndex();
  }
}
