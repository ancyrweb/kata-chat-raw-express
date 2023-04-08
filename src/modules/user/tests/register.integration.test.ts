import request from "supertest";
import { app } from "../../../http/app";

describe("Feature: Registering the User", () => {
  it("should register the user", async () => {
    const result = await request(app).post("/auth/register").send({
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
