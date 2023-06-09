import { inject, injectable } from "inversify";
import { ILiveRoomRepository } from "../../domain/ports/live-room.repository-interface";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import { InMemoryLiveRoom } from "./in-memory-live-room";

type RoomId = string;
type UserId = string;

@injectable()
export class InMemoryLiveRoomRepository implements ILiveRoomRepository {
  private rooms: Map<string, InMemoryLiveRoom> = new Map();

  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider
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

  public async refresh(userId: string) {
    this.rooms.forEach((room) => room.refresh(userId));
  }

  public async leaveAll(userId: string) {
    this.rooms.forEach((room) => room.leave(userId));
  }

  public async getUsers(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return [];
    }

    return room.getUsers();
  }
}
