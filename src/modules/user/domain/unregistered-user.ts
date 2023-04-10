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

export class UnregisteredUserTestFactory {
  static create(data?: Partial<UserData>) {
    return new UnregisteredUser({
      id: "user-id",
      username: "user-name",
      clearPassword: "hashed-password",
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
      ...data,
    });
  }
}
