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
