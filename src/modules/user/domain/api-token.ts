import { AbstractEntity } from "../../../shared/entity";
import { DomainException } from "../../../shared/errors";

type TokenData = {
  id: string;
  userId: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
};

export class APIToken extends AbstractEntity<TokenData> {
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
