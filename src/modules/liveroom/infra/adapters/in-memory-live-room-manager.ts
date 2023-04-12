import { ILiveRoomRepository } from "../../domain/ports/live-room.repository-interface";
import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { InMemoryLiveRoom } from "./in-memory-live-room";

export class InMemoryLiveRoomManager {
  private rooms: Map<string, InMemoryLiveRoom> = new Map();

  constructor(
    private dateProvider: IDateProvider,
    private readonly repository: ILiveRoomRepository
  ) {}

  public async join(userId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      this.rooms.set(roomId, new InMemoryLiveRoom(this.dateProvider));
    }

    this.rooms.get(roomId)!.join(userId);
  }

  public async leave(userId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.leave(userId);
  }

  public async leaveAll(userId: string) {
    this.rooms.forEach((room) => room.leave(userId));
  }

  public async refresh(userId: string) {
    this.rooms.forEach((room) => room.refresh(userId));
  }

  public getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }
}
