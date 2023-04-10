import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";

import {
  IAuthRepository,
  InvalidCredentialsException,
  UsernameAlreadyTakenException,
  AccessTokenPayload,
} from "../domain/ports/auth-repository.interface";
import { APIToken } from "../domain/api-token";
import { UnregisteredUser } from "../domain/unregistered-user";
import { User } from "../domain/user";
import { AccessToken } from "../domain/access-token";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";
import { addHours, addMinutes } from "date-fns";
import { IConfig, I_CONFIG } from "../../core/domain/ports/config.interface";
import { AuthenticatedUser } from "../domain/authenticated-user";
import { NotFoundException } from "../../../shared/errors";

@injectable()
export class InMemoryAuthRepository implements IAuthRepository {
  private users: User[] = [];
  private tokens: APIToken[] = [];

  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_CONFIG) private readonly config: IConfig
  ) {}

  async register(user: UnregisteredUser): Promise<User> {
    const existingUser = this.users.find((u) => u.username === user.username);
    if (existingUser) {
      throw new UsernameAlreadyTakenException();
    }

    const newUser = new User({
      id: user.id,
      username: user.username,
      hashedPassword: user.clearPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    this.users.push(newUser);
    return newUser;
  }

  async login(username: string, password: string): Promise<User> {
    const user = this.users.find(
      (u) => u.username === username && u.hashedPassword === password
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async createAPIToken(token: APIToken): Promise<void> {
    this.tokens.push(token);
  }

  async updateAPIToken(token: APIToken): Promise<void> {
    const index = this.tokens.findIndex((t) => t.id === token.id);
    this.tokens[index] = token;
  }

  async findAPITokenByValue(value: string): Promise<APIToken | null> {
    return this.tokens.find((t) => t.value === value) ?? null;
  }

  async createAccessToken(apiToken: APIToken): Promise<AccessToken> {
    const now = this.dateProvider.now();
    const expiresAt = addHours(now, 1);
    const expiresIn = expiresAt.getTime() - now.getTime();

    const token = jwt.sign(
      {
        sub: apiToken.user.id,
        username: apiToken.user.username,
      },
      this.config.getSecret(),
      {
        expiresIn,
      }
    );

    return new AccessToken({
      value: token,
      expiresAt: now,
    });
  }

  async authenticate(value: string): Promise<AuthenticatedUser> {
    const decoded = jwt.verify(
      value,
      this.config.getSecret()
    ) as AccessTokenPayload;

    const user = this.users.find((u) => u.id === decoded.sub);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return new AuthenticatedUser({
      userId: user.id,
      username: user.username,
    });
  }
}
