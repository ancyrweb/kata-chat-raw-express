import request from "supertest";
import { app } from "../../../http/app";

describe("index", () => {
  it("should return a string", async () => {
    const result = await request(app).post("/auth/register").send({
      username: "johndoe",
      password: "azerty",
    });

    expect(result.statusCode).toBe(200);
  });
});
