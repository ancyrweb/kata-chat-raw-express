import request from "supertest";
import { app } from "../../../http/app";
import { getContainer } from "../../../framework/container";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../domain/auth-repository.interface";
import { UnregisteredUser } from "../domain/unregistered-user";

describe("Feature: Logging-in the user", () => {
  describe("Case: logging with an account", () => {
    beforeEach(async () => {
      const authRepository =
        getContainer().get<IAuthRepository>(I_AUTH_REPOSITORY);

      await authRepository.register(
        new UnregisteredUser({
          id: "1",
          username: "johndoe",
          clearPassword: "azerty",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    });

    it("should log in the user", async () => {
      const result = await request(app).post("/auth/login").send({
        username: "johndoe",
        password: "azerty",
      });

      expect(result.statusCode).toBe(200);
      expect(result.body.user).toEqual({
        id: "1",
        username: "johndoe",
      });
    });
  });
});
