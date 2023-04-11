import { AbstractEntity } from "../../../shared/entity";
import { MessageOwner, MessageOwnerTestFactory } from "./message-owner";

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

export class MessageTestFactory {
  static create(data: Partial<Data> = {}): Message {
    const defaultData: Data = {
      id: "message-id",
      roomId: "room-id",
      owner: MessageOwnerTestFactory.create(),
      content: "message-content",
      createdAt: new Date("2023-01-01"),
    };

    return new Message({ ...defaultData, ...data });
  }
}
