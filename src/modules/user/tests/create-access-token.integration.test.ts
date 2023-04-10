import request from "supertest";
import { addMonths } from "date-fns";

import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../domain/ports/auth-repository.interface";
import { UnregisteredUser } from "../domain/unregistered-user";
import { App } from "../../../app";
import { APIToken } from "../domain/api-token";
import { UserTestFactory } from "../domain/user";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";

describe("Feature: Creating an access token", () => {
  describe("Case: the API token is valid", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.setup();
    });

    it("should log in the user", async () => {
      const result = await request(fixture.app.getHttp())
        .post("/auth/create-access-token")
        .send({
          apiTokenValue: "123",
        });

      expect(result.statusCode).toBe(200);

      const accessTokenValue = result.body.value;
      const user = await fixture.authRepository.authenticate(accessTokenValue);

      expect(user.userId).toBe("1");
      expect(user.username).toBe("johndoe");
    });
  });
});

export class Fixture {
  public app!: App;
  public authRepository!: IAuthRepository;

  async setup() {
    this.app = new App();
    await this.app.setup();

    const dateProvider = this.app
      .getContainer()
      .get<IDateProvider>(I_DATE_PROVIDER);

    this.authRepository = this.app
      .getContainer()
      .get<IAuthRepository>(I_AUTH_REPOSITORY);

    await this.authRepository.register(
      new UnregisteredUser({
        id: "1",
        username: "johndoe",
        clearPassword: "azerty",
        createdAt: dateProvider.now(),
        updatedAt: dateProvider.now(),
      })
    );

    await this.authRepository.createAPIToken(
      new APIToken({
        id: "1",
        user: UserTestFactory.create({
          id: "1",
        }),
        value: "123",
        createdAt: dateProvider.now(),
        expiresAt: addMonths(dateProvider.now(), 3),
        expired: false,
      })
    );
  }
}
