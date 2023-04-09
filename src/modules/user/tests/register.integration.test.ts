import request from "supertest";
import { App } from "../../../app";

let app: App;

describe("Feature: Registering the User", () => {
  beforeEach(async () => {
    app = new App();
    await app.setup();
  });

  it("should register the user", async () => {
    const result = await request(app.getHttp()).post("/auth/register").send({
      username: "johndoe",
      password: "azerty",
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      id: result.body.id,
      username: "johndoe",
    });
  });
});
