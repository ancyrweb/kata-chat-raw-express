export const I_LIVE_ROOM_REPOSITORY = Symbol("ILiveRoomRepository");

export interface ILiveRoomRepository {
  /**
   * Make the user join a room
   * @param room
   * @param userId
   */
  join(roomId: string, userId: string): Promise<void>;
  /**
   * Make the user leave a room
   * @param room
   * @param userId
   */
  leave(roomId: string, userId: string): Promise<void>;

  /**
   * Refresh the user status within all the rooms
   * @param liveRoomUser
   */
  refresh(userId: string): Promise<void>;

  /**
   * Leave all the rooms
   * @param userId
   */
  leaveAll(userId: string): Promise<void>;

  /**
   * Get all the users in a room
   * @param roomId
   */
  getUsers(roomId: string): Promise<LiveRoomUser[]>;
}

export type LiveRoomUser = {
  userId: string;
  status: Status;
};

export enum Status {
  ONLINE = "ONLINE",
  IDLE = "IDLE",
  OFFLINE = "OFFLINE",
}
