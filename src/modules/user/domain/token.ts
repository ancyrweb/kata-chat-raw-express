import { AbstractEntity } from "../../../shared/entity";

type TokenData = {
  id: string;
  userId: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
};

export class Token extends AbstractEntity<TokenData> {
  get userId() {
    return this.state.userId;
  }

  get value() {
    return this.state.value;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get expiresAt() {
    return this.state.expiresAt;
  }

  get expired() {
    return this.state.expired;
  }
}
