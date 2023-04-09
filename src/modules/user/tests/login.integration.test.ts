import request from "supertest";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../domain/auth-repository.interface";
import { UnregisteredUser } from "../domain/unregistered-user";
import { App } from "../../../app";

let app: App;

describe("Feature: Logging-in the user", () => {
  describe("Case: logging with an account", () => {
    beforeEach(async () => {
      app = new App();
      await app.setup();

      const authRepository = app
        .getContainer()
        .get<IAuthRepository>(I_AUTH_REPOSITORY);

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
      const result = await request(app.getHttp()).post("/auth/login").send({
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
