import { AbstractEntity } from "../../../shared/entity";

type UserData = {
  id: string;
  username: string;
  clearPassword: string;
  createdAt: Date;
  updatedAt: Date;
};

export class UnregisteredUser extends AbstractEntity<UserData> {
  get username() {
    return this.state.username;
  }

  get clearPassword() {
    return this.state.clearPassword;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }
}
