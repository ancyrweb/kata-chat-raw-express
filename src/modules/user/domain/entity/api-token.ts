import { AbstractEntity } from "../../../../shared/entity";
import { DomainException } from "../../../../shared/errors";
import { User } from "./user";

type TokenData = {
  id: string;
  user: User;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
};

export class APIToken extends AbstractEntity<TokenData> {
  get user() {
    return this.state.user;
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

  dateExpired(now: Date) {
    return this.expiresAt < now;
  }

  isMarkedAsExpired() {
    return this.expired;
  }

  markAsExpired() {
    this.setState({
      expired: true,
    });
  }
}

export class TokenExpiredException extends DomainException {
  constructor() {
    super("Token is expired", "TOKEN_EXPIRED");
  }
}
