import { Socket, Server } from "socket.io";
import * as http from "http";
import { inject, injectable } from "inversify";

import { AuthenticatedUser } from "../../user/domain/entity/authenticated-user";
import { OrNull } from "../../../types";
import { I_HTTP_SERVER } from "../../../framework/kernel";
import { ILogger, I_LOGGER } from "../domain/ports/logger.interface";
import { JoinRoomUseCase } from "../../liveroom/domain/use-cases/join-room.usecase";
import { LeaveRoomUseCase } from "../../liveroom/domain/use-cases/leave-room.usecase";
import { LeaveAllRoomsUseCase } from "../../liveroom/domain/use-cases/leave-all-rooms.usecase";

@injectable()
export class SocketServer {
  private readonly clients: Map<string, SocketClient> = new Map();
  private server: OrNull<Server> = null;

  constructor(
    @inject(I_HTTP_SERVER) private readonly httpServer: http.Server,
    @inject(I_LOGGER) private readonly logger: ILogger,

    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase,
    private readonly leaveAllRoomsUseCase: LeaveAllRoomsUseCase
  ) {}

  start() {
    this.logger.info("Socket Server starting up");

    this.server = new Server(this.httpServer);
    this.server.on("connection", (socket) => {
      const client = new SocketClient(socket);
      this.clients.set(socket.id, client);

      socket.on("authenticate", (data: { userId: string }) => {
        client.authenticate(
          new AuthenticatedUser({
            userId: data.userId,
            username: "John Doe",
          })
        );
      });

      socket.on("join room", async (data: { roomId: string }) => {
        await this.joinRoomUseCase.execute({
          roomId: data.roomId,
          requester: client.getUser()!,
        });
      });

      socket.on("leave room", async (data: { roomId: string }) => {
        await this.leaveRoomUseCase.execute({
          roomId: data.roomId,
          requester: client.getUser()!,
        });
      });

      socket.on("disconnect", async () => {
        await this.leaveAllRoomsUseCase.execute({
          requester: client.getUser()!,
        });

        this.clients.delete(socket.id);
      });
    });

    this.server.on("error", (err) => {
      this.logger.error("Socket Server error", err);
    });
  }
}

export class SocketClient {
  private user: OrNull<AuthenticatedUser> = null;

  constructor(private readonly socket: Socket) {}

  authenticate(user: AuthenticatedUser) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }
}
