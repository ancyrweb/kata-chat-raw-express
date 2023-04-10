import { inject, injectable } from "inversify";

import { FSDB, FSDBNotFoundException } from "../../../../shared/fsdb";
import { IRoomRepository } from "../../domain/ports/room.repository-interface";
import { RoomOwner } from "../../domain/room-owner";
import { IConfig, I_CONFIG } from "../../../core/domain/ports/config.interface";
import { Room } from "../../domain/room";
import { Message } from "../../domain/message";
import { MessageOwner } from "../../domain/message-owner";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../../../user/domain/ports/auth-repository.interface";

@injectable()
export class FSRoomRepository implements IRoomRepository {
  private readonly rooms: FSDB<FSDB_Room>;
  private readonly messages: FSDB<FSDB_Message>;

  constructor(
    @inject(I_CONFIG) config: IConfig,
    @inject(I_AUTH_REPOSITORY) private readonly authRepository: IAuthRepository
  ) {
    this.rooms = new FSDB<FSDB_Room>(config.getFSDBDirectory(), "rooms.json");
    this.messages = new FSDB<FSDB_Message>(
      config.getFSDBDirectory(),
      "messages.json"
    );
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

  async createMessage(message: Message): Promise<void> {
    const room = this.rooms.find((r) => r.id === message.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    this.messages.insert(FSDB_MessageMapper.toFSDB(message));
  }

  async findMessageById(id: string): Promise<Message | null> {
    const message = this.messages.find((m) => m.id === id);
    if (!message) {
      return null;
    }

    const user = await this.authRepository.findUserById(message.ownerId);
    if (!user) {
      throw new FSDBNotFoundException();
    }

    return FSDB_MessageMapper.toEntity(message, {
      id: user.id,
      username: user.username,
    });
  }

  async findMessagesByRoomId(roomId: string): Promise<Message[]> {
    const messages = this.messages.filter((m) => m.roomId === roomId);
    return Promise.all(
      messages.map(async (m) => {
        const user = await this.authRepository.findUserById(m.ownerId);
        if (!user) {
          throw new FSDBNotFoundException();
        }

        return FSDB_MessageMapper.toEntity(m, {
          id: user.id,
          username: user.username,
        });
      })
    );
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

export type FSDB_Message = {
  id: string;
  roomId: string;
  content: string;
  createdAt: Date;
  ownerId: string;
};

export type FSDB_MessageOwner = {
  id: string;
  username: string;
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

class FSDB_MessageMapper {
  static toEntity(message: FSDB_Message, owner: FSDB_MessageOwner): Message {
    return new Message({
      id: message.id,
      roomId: message.roomId,
      content: message.content,
      createdAt: message.createdAt,
      owner: new MessageOwner({
        id: owner.id,
        username: owner.username,
      }),
    });
  }

  static toFSDB(message: Message): FSDB_Message {
    return {
      id: message.id,
      roomId: message.roomId,
      content: message.content,
      createdAt: message.createdAt,
      ownerId: message.owner.id,
    };
  }
}
