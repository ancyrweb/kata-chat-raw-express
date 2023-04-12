import { Socket, Server as SocketServer } from "socket.io";
import { Socket as ClientSocket, io } from "socket.io-client";
import * as http from "http";

import { App } from "../../app";
import { wait } from "../../shared/promise.utils";

describe("Feature: Live Room", () => {
  describe("Scenario: subscribing to a room", () => {
    let clientSocket: ClientSocket;
    let serverSocket: SocketServer;
    let server: http.Server;

    beforeEach(async () => {
      const app = new App();
      await app.setup();

      return new Promise((resolve) => {
        app.listen(() => {
          server = app.getServer();
          const address = server.address() as any;
          clientSocket = io(`http://localhost:${address.port}`);
          serverSocket = new SocketServer(server);
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

    it("should receive a message when a new message is sent", async () => {
      const sockets: Socket[] = [];
      serverSocket.on("connection", (socket) => {
        sockets.push(socket);
        socket.on("join-room", (data) => {
          socket.join(data.roomId);
          socket.to(data.roomId).emit("user-joined", { userId: "123" });
        });
      });

      clientSocket.emit("join-room", { roomId: "123" });

      await wait(1000);
    });
  });
});
