import { Room } from "../domain/room";
import { RoomOwner } from "../domain/room-owner";

export const I_ROOM_REPOSITORY = Symbol("IRoomRepository");

export interface IRoomRepository {
  create(room: Room): Promise<void>;
  findById(id: string): Promise<Room | null>;

  findRoomOwnerById(id: string): Promise<RoomOwner | null>;
}
