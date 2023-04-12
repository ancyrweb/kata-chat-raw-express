import { inject, injectable } from "inversify";
import { ILiveRoomRepository } from "../../domain/ports/live-room.repository-interface";
import { LiveRoomUser } from "../../domain/entity/live-room-user";
import { Room } from "../../../room/domain/entity/room";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";

type RoomId = string;
type UserId = string;

@injectable()
export class InMemoryLiveRoomRepository implements ILiveRoomRepository {
  private liveRoomUsers: Map<RoomId, Map<UserId, LiveRoomUser>> = new Map();

  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider
  ) {}

  async joinRoom(room: Room, userId: string): Promise<void> {
    const liveRoomUsers = this.liveRoomUsers.get(room.id) ?? new Map();

    liveRoomUsers.set(
      userId,
      LiveRoomUser.create(room.id, userId, this.dateProvider.now())
    );

    this.liveRoomUsers.set(room.id, liveRoomUsers);
  }

  async leaveRoom(room: Room, userId: string): Promise<void> {
    const liveRoomUsers = this.liveRoomUsers.get(room.id) ?? new Map();
    liveRoomUsers.delete(userId);
    this.liveRoomUsers.set(room.id, liveRoomUsers);
  }

  async findLiveRoomUser(
    roomId: string,
    userId: string
  ): Promise<LiveRoomUser> {
    const liveRoomUsers = this.liveRoomUsers.get(roomId) || new Map();
    return liveRoomUsers.get(userId);
  }

  async update(liveRoomUser: LiveRoomUser): Promise<void> {
    const liveRoomUsers =
      this.liveRoomUsers.get(liveRoomUser.roomId) ?? new Map();

    liveRoomUsers.set(liveRoomUser.userId, liveRoomUser);

    this.liveRoomUsers.set(liveRoomUser.roomId, liveRoomUsers);
  }
}
