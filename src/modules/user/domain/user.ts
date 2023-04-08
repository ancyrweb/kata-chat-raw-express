import { AbstractEntity } from "../../../shared/entity";

type UserData = {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
};

export class User extends AbstractEntity<UserData> {
  get username() {
    return this.state.username;
  }

  get hashedPassword() {
    return this.state.hashedPassword;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }
}
