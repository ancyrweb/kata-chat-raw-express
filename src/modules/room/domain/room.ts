import { AbstractEntity } from "../../../shared/entity";
import { RoomOwner } from "./room-owner";

type RoomData = {
  id: string;
  name: string;
  owner: RoomOwner;
  createdAt: Date;
  updatedAt: Date;
};

export class Room extends AbstractEntity<RoomData> {
  get id() {
    return this.state.id;
  }

  get name() {
    return this.state.name;
  }

  get owner() {
    return this.state.owner;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }
}
