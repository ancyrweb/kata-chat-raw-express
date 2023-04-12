import { Socket, Server as SocketServer } from "socket.io";
import { Socket as ClientSocket, io } from "socket.io-client";
import * as http from "http";

import { App } from "../../app";
import { wait } from "../../shared/promise.utils";
import { FakeDateProvider } from "../core/infra/adapters/fake.date-provider";
import { AuthenticatedUser } from "../user/domain/entity/authenticated-user";
import { LeaveRoomUseCase } from "./domain/use-cases/leave-room.usecase";
import {
  Status,
  I_LIVE_ROOM_REPOSITORY,
} from "./domain/ports/live-room.repository-interface";
import { JoinRoomUseCase } from "./domain/use-cases/join-room.usecase";
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
    let serverSocket: SocketServer;
    let server: http.Server;

    let dateProvider = new FakeDateProvider();
    let liveRoomSocketServer: LiveRoomSocketServer;

    beforeEach(async () => {
      app = new App();
      await app.setup();

      const roomRepository = app
        .getContainer()
        .get<IRoomRepository>(I_ROOM_REPOSITORY);

      await roomRepository.create(
        RoomTestFactory.create({
          id: "room1",
        })
      );

      dateProvider = new FakeDateProvider();

      return new Promise((resolve) => {
        app.listen(() => {
          server = app.getServer();
          const address = server.address() as any;
          clientSocket = io(`http://localhost:${address.port}`);
          serverSocket = new SocketServer(server);

          liveRoomSocketServer = new LiveRoomSocketServer(
            serverSocket,
            app.getContainer().get(JoinRoomUseCase),
            app.getContainer().get(LeaveRoomUseCase)
          );

          resolve(null);
        });
      });
    });

    afterEach(async () => {
      return new Promise((resolve) => {
        clientSocket.close();
        serverSocket.close();
        server.close((err) => {
          resolve(null);
        });
      });
    });

    it("should join a room", async () => {
      clientSocket.emit("authenticate", { userId: "123" });
      await wait(100);
      clientSocket.emit("join", { roomId: "room1" });
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
      clientSocket.emit("authenticate", { userId: "123" });
      await wait(50);
      clientSocket.emit("join", { roomId: "room1" });
      await wait(50);
      clientSocket.emit("leave", { roomId: "room1" });
      await wait(50);

      const users = await app
        .getContainer()
        .get<InMemoryLiveRoomRepository>(I_LIVE_ROOM_REPOSITORY)
        .getUsers("room1");

      expect(users).toEqual([]);
    });
  });
});

class LiveRoomSocket {
  constructor(
    private readonly socket: Socket,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase
  ) {}

  setup() {
    this.socket.on("authenticate", (data: { userId: string }) => {
      this.socket.data.user = new AuthenticatedUser({
        userId: data.userId,
        username: "John Doe",
      });
    });

    this.socket.on("join", async (data: { roomId: string }) => {
      const result = await this.joinRoomUseCase.execute({
        roomId: data.roomId,
        requester: this.socket.data.user,
      });
    });

    this.socket.on("leave", async (data: { roomId: string }) => {
      const result = await this.leaveRoomUseCase.execute({
        roomId: data.roomId,
        requester: this.socket.data.user,
      });
    });
  }

  clear() {
    // this.manager.leaveAll(this.socket.data.userId);
  }
}

class LiveRoomSocketServer {
  private readonly clients: Map<string, LiveRoomSocket> = new Map();

  constructor(
    private readonly server: SocketServer,

    readonly joinRoomUseCase: JoinRoomUseCase,
    readonly leaveRoomUseCase: LeaveRoomUseCase
  ) {
    this.server.on("connection", (socket) => {
      const liveRoomSocket = new LiveRoomSocket(
        socket,
        joinRoomUseCase,
        leaveRoomUseCase
      );

      this.clients.set(socket.id, liveRoomSocket);

      liveRoomSocket.setup();

      socket.on("disconnect", () => {
        liveRoomSocket.clear();
        this.clients.delete(socket.id);
      });
    });
  }
}
