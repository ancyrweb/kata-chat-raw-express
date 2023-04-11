import request from "supertest";
import { App } from "../../../app";
import { AuthIntegration } from "../../user/tests-utils/auth-integration";
import { UnregisteredUserTestFactory } from "../../user/domain/entity/unregistered-user";
import { AccessToken } from "../../user/domain/entity/access-token";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../domain/ports/room.repository-interface";
import { Room } from "../domain/entity/room";
import { RoomOwner } from "../domain/entity/room-owner";
describe("Feature: renaming a room", () => {
  describe("Case: the name is valid", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.withRoom().setup();
    });

    it("should succeed", async () => {
      const result = await request(fixture.app.getHttp())
        .put("/rooms/1/name")
        .set("Authorization", `Bearer ${fixture.accessToken.value}`)
        .send({
          name: "A new name",
        });

      expect(result.statusCode).toBe(200);
      expect(result.body).toMatchObject({
        name: "A new name",
      });
    });
  });

  describe("Case: the room does not exist", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.withoutRoom().setup();
    });

    it("should fail with 404", async () => {
      const result = await request(fixture.app.getHttp())
        .put("/rooms/1/name")
        .set("Authorization", `Bearer ${fixture.accessToken.value}`)
        .send({
          name: "A new name",
        });

      expect(result.statusCode).toBe(404);
    });
  });
});

export class Fixture {
  public app!: App;
  public accessToken!: AccessToken;

  private _withRoom = false;

  withRoom() {
    this._withRoom = true;
    return this;
  }

  withoutRoom() {
    this._withRoom = false;
    return this;
  }

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

    if (this._withRoom) {
      const roomRepository = this.app
        .getContainer()
        .get<IRoomRepository>(I_ROOM_REPOSITORY);

      await roomRepository.create(
        new Room({
          id: "1",
          name: "My room",
          owner: new RoomOwner({
            id: "1",
            roomsCreatedAmount: 1,
          }),
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        })
      );
    }
  }
}
