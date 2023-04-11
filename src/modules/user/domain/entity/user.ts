import { AbstractEntity } from "../../../../shared/entity";

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

export class UserTestFactory {
  static create(data?: Partial<UserData>) {
    return new User({
      id: "user-id",
      username: "user-name",
      hashedPassword: "hashed-password",
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
      ...data,
    });
  }
}
