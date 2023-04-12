import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import {
  LiveRoomUser,
  Status,
} from "../../domain/ports/live-room.repository-interface";

export class InMemoryLiveRoom {
  private users: LiveRoomUserObj[] = [];

  constructor(private dateProvider: IDateProvider) {}

  join(userId: string) {
    this.users.push(new LiveRoomUserObj(userId, this.dateProvider.now()));
  }

  leave(userId: string) {
    this.users = this.users.filter((user) => user.userId !== userId);
  }

  refresh(userId: string) {
    const user = this.users.find((user) => user.userId === userId);
    user?.refresh(this.dateProvider.now());
  }

  getUsers(): LiveRoomUser[] {
    return this.users.map((user) => ({
      userId: user.userId,
      status: user.getStatus(this.dateProvider.now()),
    }));
  }
}

export class LiveRoomUserObj {
  constructor(private _userId: string, private _lastActionAt: Date) {}

  get userId() {
    return this._userId;
  }

  getStatus(at: Date) {
    const diff = at.getTime() - this._lastActionAt.getTime();

    if (diff >= 10 * 60 * 1000) {
      return Status.OFFLINE;
    } else if (diff >= 5 * 60 * 1000) {
      return Status.IDLE;
    }

    return Status.ONLINE;
  }

  refresh(at: Date) {
    this._lastActionAt = at;
  }
}
