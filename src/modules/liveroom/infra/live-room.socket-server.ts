import { Socket, Server as SocketServer } from "socket.io";
import * as http from "http";

import { JoinRoomUseCase } from "../domain/use-cases/join-room.usecase";
import { LeaveRoomUseCase } from "../domain/use-cases/leave-room.usecase";
import { LeaveAllRoomsUseCase } from "../domain/use-cases/leave-all-rooms.usecase";
import { AuthenticatedUser } from "../../user/domain/entity/authenticated-user";
import { OrNull } from "../../../types";
import { inject, injectable } from "inversify";
import { I_HTTP_SERVER } from "../../../framework/kernel";
import { ILogger, I_LOGGER } from "../../core/domain/ports/logger.interface";

@injectable()
export class LiveRoomSocketServer {
  private readonly clients: Map<string, LiveRoomSocket> = new Map();
  private server: OrNull<SocketServer> = null;

  constructor(
    @inject(I_HTTP_SERVER) private readonly httpServer: http.Server,
    @inject(I_LOGGER) private readonly logger: ILogger,

    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase,
    private readonly leaveAllRoomsUseCase: LeaveAllRoomsUseCase
  ) {}

  start() {
    this.logger.info("LiveRoom Socket Server starting up");

    this.server = new SocketServer(this.httpServer);
    this.server.on("connection", (socket) => {
      const liveRoomSocket = new LiveRoomSocket(
        socket,
        this.joinRoomUseCase,
        this.leaveRoomUseCase,
        this.leaveAllRoomsUseCase
      );

      this.clients.set(socket.id, liveRoomSocket);
      liveRoomSocket.setup();

      socket.on("disconnect", async () => {
        await liveRoomSocket.clear();
        this.clients.delete(socket.id);
      });
    });

    this.server.on("error", (err) => {
      this.logger.error("LiveRoom Socket Server error", err);
    });
  }

  getSocket() {
    return this.server;
  }
}

class LiveRoomSocket {
  private user: OrNull<AuthenticatedUser> = null;
  constructor(
    private readonly socket: Socket,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase,
    private readonly leaveAllRoomsUseCase: LeaveAllRoomsUseCase
  ) {}

  setup() {
    this.socket.on("authenticate", (data: { userId: string }) => {
      this.user = new AuthenticatedUser({
        userId: data.userId,
        username: "John Doe",
      });
    });

    this.socket.on("join", async (data: { roomId: string }) => {
      const result = await this.joinRoomUseCase.execute({
        roomId: data.roomId,
        requester: this.user!,
      });
    });

    this.socket.on("leave", async (data: { roomId: string }) => {
      const result = await this.leaveRoomUseCase.execute({
        roomId: data.roomId,
        requester: this.user!,
      });
    });
  }

  async clear() {
    const result = await this.leaveAllRoomsUseCase.execute({
      requester: this.user!,
    });
  }
}
