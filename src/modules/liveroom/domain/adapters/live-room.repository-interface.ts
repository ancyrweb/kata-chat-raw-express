import { Room } from "../../../room/domain/entity/room";
import { LiveRoomUser } from "../entity/live-room-user";

export const I_LIVE_ROOM_REPOSITORY = Symbol("ILiveRoomRepository");

export interface ILiveRoomRepository {
  /**
   * Make the user join a room and creates a LiveRoomUser
   * @param room
   * @param userId
   */
  joinRoom(room: Room, userId: string): Promise<void>;
  /**
   * Make the user leave a room and destroys the LiveRoomUser
   * @param room
   * @param userId
   */
  leaveRoom(room: Room, userId: string): Promise<void>;

  /**
   * Find a LiveRoomUser by roomId and userId
   * @param roomId
   * @param userId
   */
  findLiveRoomUser(roomId: string, userId: string): Promise<LiveRoomUser>;

  /**
   * Save a LiveRoomUser
   * @param liveRoomUser
   */
  update(liveRoomUser: LiveRoomUser): Promise<void>;
}
