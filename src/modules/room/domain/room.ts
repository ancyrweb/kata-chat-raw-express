import { AbstractEntity } from "../../../shared/entity";
import { RoomOwner, RoomOwnerTestFactory } from "./room-owner";

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

  rename(name: string, at: Date) {
    this.setState({
      name,
      updatedAt: at,
    });
  }
}

export class RoomTestFactory {
  static create(data: Partial<RoomData> = {}): Room {
    const defaultData: RoomData = {
      id: "room-id",
      name: "room-name",
      owner: RoomOwnerTestFactory.create(),
      createdAt: new Date("2021-01-01"),
      updatedAt: new Date("2021-01-01"),
    };

    return new Room({ ...defaultData, ...data });
  }
}
