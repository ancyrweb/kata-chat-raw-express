import { injectable } from "inversify";

@injectable()
export class CoreService {
  getIndex() {
    return {
      version: "1",
      app: "chat",
    };
  }
}
