import { AbstractEntity } from "../../../shared/entity";
import { MessageOwner } from "./message-owner";

type Data = {
  id: string;
  roomId: string;
  owner: MessageOwner;
  content: string;
  createdAt: Date;
};

export class Message extends AbstractEntity<Data> {
  get owner(): MessageOwner {
    return this.state.owner;
  }

  get roomId(): string {
    return this.state.roomId;
  }

  get content(): string {
    return this.state.content;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }
}
