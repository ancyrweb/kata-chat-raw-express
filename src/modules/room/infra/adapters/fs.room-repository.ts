import { inject, injectable } from "inversify";
import { FSDB } from "../../../../shared/fsdb";
import { IRoomRepository } from "../../domain/ports/room.repository-interface";
import { RoomOwner } from "../../domain/room-owner";
import { IConfig, I_CONFIG } from "../../../core/domain/ports/config.interface";
import { Room } from "../../domain/room";

@injectable()
export class FSRoomRepository implements IRoomRepository {
  private readonly rooms: FSDB<FSDB_Room>;

  constructor(@inject(I_CONFIG) config: IConfig) {
    this.rooms = new FSDB<FSDB_Room>(config.getFSDBDirectory(), "rooms.json");
  }

  async create(room: Room): Promise<void> {
    this.rooms.insert(FSDB_RoomMapper.toFSDB(room));
  }

  async update(room: Room): Promise<void> {
    this.rooms.update((r) => r.id === room.id, FSDB_RoomMapper.toFSDB(room));
  }

  async findById(id: string): Promise<Room | null> {
    const room = this.rooms.find((r) => r.id === id);
    if (!room) {
      return null;
    }

    const roomsCreatedByUser = this.rooms.aggregate(
      (acc, r) => (r.ownerId === room.ownerId ? acc + 1 : 0),
      0
    );

    return FSDB_RoomMapper.toEntity(room, {
      id: room.ownerId,
      roomsCreatedAmount: roomsCreatedByUser,
    });
  }

  async findRoomOwnerById(id: string): Promise<RoomOwner | null> {
    const roomsCreatedByUser = this.rooms.aggregate(
      (acc, r) => (r.ownerId === id ? acc + 1 : acc),
      0
    );

    return new RoomOwner({
      id,
      roomsCreatedAmount: roomsCreatedByUser,
    });
  }
}

export type FSDB_Room = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FSDB_RoomOwner = {
  id: string;
  roomsCreatedAmount: number;
};

class FSDB_RoomMapper {
  static toEntity(room: FSDB_Room, owner: FSDB_RoomOwner): Room {
    return new Room({
      id: room.id,
      name: room.name,
      owner: new RoomOwner({
        id: owner.id,
        roomsCreatedAmount: owner.roomsCreatedAmount,
      }),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    });
  }

  static toFSDB(room: Room): FSDB_Room {
    return {
      id: room.id,
      name: room.name,
      ownerId: room.owner.id,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
