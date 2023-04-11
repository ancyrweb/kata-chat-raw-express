import { AbstractEntity } from "../../../shared/entity";

type Data = {
  id: string;
  username: string;
};

export class MessageOwner extends AbstractEntity<Data> {
  get username(): string {
    return this.state.username;
  }
}

export class MessageOwnerTestFactory {
  static create(data: Partial<Data> = {}): MessageOwner {
    const defaultData: Data = {
      id: "message-owner-id",
      username: "message-owner-username",
    };

    return new MessageOwner({ ...defaultData, ...data });
  }
}
