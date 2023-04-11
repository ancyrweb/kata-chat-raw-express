import request from "supertest";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../../user/domain/ports/auth-repository.interface";
import { App } from "../../../app";
import { AuthIntegration } from "../../user/tests-utils/auth-integration";
import { UnregisteredUserTestFactory } from "../../user/domain/unregistered-user";
import { AccessToken } from "../../user/domain/access-token";
import { User, UserTestFactory } from "../../user/domain/user";
import { Message, MessageTestFactory } from "../domain/entity/message";
import { MessageOwnerTestFactory } from "../domain/entity/message-owner";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../domain/ports/room.repository-interface";
import { Room, RoomTestFactory } from "../domain/entity/room";
import { RoomOwnerTestFactory } from "../domain/entity/room-owner";
describe("Feature: getting messages", () => {
  describe("Case: there are no messages in the room", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture.setup();
    });

    it("should succeed when there is no messages", async () => {
      const result = await request(fixture.app.getHttp())
        .get("/rooms/room1/messages")
        .set("Authorization", `Bearer ${fixture.accessToken.value}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        messages: [],
      });
    });
  });

  describe("Case: there's one message in the room", () => {
    let fixture: Fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      await fixture
        .withUsers([
          UserTestFactory.create({
            id: "user1",
            username: "johndoe",
          }),
        ])
        .withRoom(
          RoomTestFactory.create({
            id: "room1",
            name: "My room",
            owner: RoomOwnerTestFactory.create({
              id: "user1",
              roomsCreatedAmount: 1,
            }),
          })
        )
        .withMessages([
          MessageTestFactory.create({
            id: "message1",
            roomId: "room1",
            content: "Hello world!",
            owner: MessageOwnerTestFactory.create({
              id: "user1",
              username: "johndoe",
            }),
            createdAt: new Date("2023-01-01T00:00:00.000"),
          }),
        ])
        .authenticateWith("user1")
        .setup();
    });

    it("should succeed when there is no messages", async () => {
      const result = await request(fixture.app.getHttp())
        .get("/rooms/room1/messages")
        .set("Authorization", `Bearer ${fixture.accessToken.value}`);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        messages: [
          {
            id: "message1",
            content: "Hello world!",
            roomId: "room1",
            owner: {
              id: "user1",
              username: "johndoe",
            },
            createdAt: new Date("2023-01-01T00:00:00.000").toISOString(),
          },
        ],
      });
    });
  });
});

class Fixture {
  public app!: App;
  public accessToken!: AccessToken;

  private _withUsers: User[] = [];
  private _withRoom: Room | null = null;
  private _withMessages: Message[] = [];
  private _authenticateWith: string | null = null;

  withUsers(users: User[]) {
    this._withUsers = users;
    return this;
  }

  withRoom(room: Room) {
    this._withRoom = room;
    return this;
  }

  withMessages(messages: Message[]) {
    this._withMessages = messages;
    return this;
  }

  authenticateWith(userId: string) {
    this._authenticateWith = userId;
    return this;
  }

  async setup() {
    this.app = new App();
    await this.app.setup();

    const authRepository = this.app
      .getContainer()
      .get<IAuthRepository>(I_AUTH_REPOSITORY);

    const roomRepository = this.app
      .getContainer()
      .get<IRoomRepository>(I_ROOM_REPOSITORY);

    await Promise.all(
      this._withUsers.map((user) => authRepository.create(user))
    );

    if (this._withRoom) {
      await roomRepository.create(this._withRoom);
    }

    await Promise.all(
      this._withMessages.map((message) => roomRepository.createMessage(message))
    );

    const authIntegration = new AuthIntegration(this.app);

    if (this._authenticateWith) {
      this.accessToken = await authIntegration.authenticate(
        this._authenticateWith
      );
    } else {
      this.accessToken = await authIntegration.createUserAndAuthenticate(
        UnregisteredUserTestFactory.create({
          id: "1",
          username: "johndoe",
        })
      );
    }
  }
}
