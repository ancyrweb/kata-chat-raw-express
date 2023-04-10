import { Room } from "../room";
import { RoomOwner } from "../room-owner";

export const I_ROOM_REPOSITORY = Symbol("IRoomRepository");

export interface IRoomRepository {
  create(room: Room): Promise<void>;
  update(room: Room): Promise<void>;
  findById(id: string): Promise<Room | null>;

  findRoomOwnerById(id: string): Promise<RoomOwner | null>;
}
