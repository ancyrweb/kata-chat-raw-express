import request from "supertest";
import { IAuthRepository } from "../../user/domain/ports/auth-repository.interface";
import { App } from "../../../app";
import { AuthIntegration } from "../../user/tests-utils/auth-integration";
import { UnregisteredUserTestFactory } from "../../user/domain/unregistered-user";
import { AccessToken } from "../../user/domain/access-token";
describe("Feature: creating a room", () => {
  describe("Case: the room is valid", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.setup();
    });

    it("should succeed", async () => {
      const result = await request(fixture.app.getHttp())
        .post("/rooms")
        .set("Authorization", `Bearer ${fixture.accessToken.value}`)
        .send({
          name: "My room",
        });

      expect(result.statusCode).toBe(201);
      expect(result.body).toMatchObject({
        name: "My room",
      });
    });
  });

  describe("Case: the user is not authenticated", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.setup();
    });

    it("should reject", async () => {
      const result = await request(fixture.app.getHttp()).post("/rooms").send({
        name: "My room",
      });

      expect(result.statusCode).toBe(401);
      expect(result.body).toEqual({
        code: "not-authenticated",
        message: "You must be authenticated to do this.",
        status: 401,
      });
    });
  });
});

class Fixture {
  public app!: App;
  public authRepository!: IAuthRepository;
  public accessToken!: AccessToken;

  async setup() {
    this.app = new App();
    await this.app.setup();

    const authIntegration = new AuthIntegration(this.app);

    this.accessToken = await authIntegration.createUserAndAuthenticate(
      UnregisteredUserTestFactory.create({
        id: "1",
        username: "johndoe",
      })
    );
  }
}
