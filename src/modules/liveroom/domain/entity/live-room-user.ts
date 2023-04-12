import { AbstractEntity } from "../../../../shared/entity";

type Data = {
  id: string;
  roomId: string;
  userId: string;
  lastActionAt: Date;
};

export class LiveRoomUser extends AbstractEntity<Data> {
  get id() {
    return this.state.id;
  }

  get roomId() {
    return this.state.roomId;
  }

  get userId() {
    return this.state.userId;
  }

  get lastActionAt() {
    return this.state.lastActionAt;
  }

  makeAction(at: Date) {
    this.setState({
      lastActionAt: at,
    });
  }
}
