import { injectable } from "inversify";
import { IPresenter } from "../../../../shared/presenter";
import { Room } from "../entity/room";

type Output = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@injectable()
export class RoomPresenter implements IPresenter<Room, Output> {
  public async transform(room: Room): Promise<Output> {
    return {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
