import { app } from "./http/app";
import request from "supertest";

describe("index", () => {
  it("should return a string", async () => {
    const result = await request(app).get("/");

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      version: "1",
      app: "chat",
    });
  });
});
