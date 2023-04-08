import { CoreController } from "./core.controller";
import { CoreService } from "./core.service";

describe("core", () => {
  it("should return the home informations", async () => {
    const controller = new CoreController(new CoreService());
    const result = await controller.getIndex();

    expect(result).toEqual({
      version: "1",
      app: "chat",
    });
  });
});
