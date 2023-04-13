import { Socket as ClientSocket, io } from "socket.io-client";
import * as http from "http";

import { App } from "../../app";
import { wait } from "../../shared/promise.utils";
import {
  Status,
  I_LIVE_ROOM_REPOSITORY,
} from "./domain/ports/live-room.repository-interface";
import { InMemoryLiveRoomRepository } from "./infra/adapters/in-memory.live-room-repository";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../room/domain/ports/room.repository-interface";
import { RoomTestFactory } from "../room/domain/entity/room";

describe("Feature: Live Room", () => {
  describe("Scenario: joining to a room", () => {
    let app: App;
    let clientSocket: ClientSocket;
    let server: http.Server;

    beforeEach(async () => {
      app = new App();
      app.setup();

      const roomRepository = app
        .getContainer()
        .get<IRoomRepository>(I_ROOM_REPOSITORY);

      await roomRepository.create(
        RoomTestFactory.create({
          id: "room1",
        })
      );

      return new Promise((resolve) => {
        app.listen(() => {
          server = app.getServer();
          const address = server.address() as any;
          clientSocket = io(`http://localhost:${address.port}`, {});

          resolve(null);
        });
      });
    });

    afterEach(async () => {
      return new Promise((resolve, reject) => {
        clientSocket.close();
        app.stop();
        wait(100).then(() => {
          resolve(null);
        });
      });
    });

    it("should join a room", async () => {
      clientSocket.emit("authenticate", { userId: "123" });
      await wait(100);
      clientSocket.emit("join room", { roomId: "room1" });
      await wait(100);

      const users = await app
        .getContainer()
        .get<InMemoryLiveRoomRepository>(I_LIVE_ROOM_REPOSITORY)
        .getUsers("room1");

      expect(users).toEqual([
        {
          userId: "123",
          status: Status.ONLINE,
        },
      ]);
    });

    it("should leave a room", async () => {
      const repository = app
        .getContainer()
        .get<InMemoryLiveRoomRepository>(I_LIVE_ROOM_REPOSITORY);

      clientSocket.emit("authenticate", { userId: "123" });
      await wait(50);
      clientSocket.emit("join room", { roomId: "room1" });
      await wait(100);

      const usersAfterJoin = await repository.getUsers("room1");
      expect(usersAfterJoin).toEqual([
        {
          userId: "123",
          status: Status.ONLINE,
        },
      ]);

      clientSocket.emit("leave room", { roomId: "room1" });
      await wait(50);

      const users = await repository.getUsers("room1");
      expect(users).toEqual([]);
    });
  });
});
