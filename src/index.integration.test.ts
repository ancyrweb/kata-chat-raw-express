import request from "supertest";
import { App } from "./app";

describe("index", () => {
  it("should return a string", async () => {
    const app = new App();
    await app.setup();

    const result = await request(app.getHttp()).get("/");

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      version: "1",
      app: "chat",
    });
  });
});
