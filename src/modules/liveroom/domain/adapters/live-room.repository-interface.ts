import { Room } from "../../../room/domain/entity/room";

export const I_LIVE_ROOM_REPOSITORY = Symbol("ILiveRoomRepository");

export interface ILiveRoomRepository {
  joinRoom(room: Room, userId: string): Promise<void>;
  leaveRoom(room: Room, userId: string): Promise<void>;
}
