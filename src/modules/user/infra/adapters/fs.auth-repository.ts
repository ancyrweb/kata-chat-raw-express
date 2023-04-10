import { inject, injectable } from "inversify";
import bcrypt from "bcrypt";
import { addSeconds } from "date-fns";
import jwt from "jsonwebtoken";

import {
  IAuthRepository,
  InvalidCredentialsException,
  UsernameAlreadyTakenException,
  AccessTokenPayload,
} from "../../domain/ports/auth-repository.interface";
import { APIToken } from "../../domain/api-token";
import { UnregisteredUser } from "../../domain/unregistered-user";
import { User } from "../../domain/user";
import { FSDB } from "../../../../shared/fsdb";
import { IConfig, I_CONFIG } from "../../../core/domain/ports/config.interface";
import { ExtractState } from "../../../../shared/entity";
import { AccessToken } from "../../domain/access-token";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import { OrNull } from "../../../../types";
import { AuthenticatedUser } from "../../domain/authenticated-user";
import { NotFoundException } from "../../../../shared/errors";

@injectable()
export class FSAuthRepository implements IAuthRepository {
  private users: FSDB<FSDB_User>;
  private tokens: FSDB<FSDB_APIToken>;

  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_CONFIG) private readonly config: IConfig
  ) {
    this.users = new FSDB<User>(config.getFSDBDirectory(), "users.json");
    this.tokens = new FSDB<FSDB_APIToken>(
      config.getFSDBDirectory(),
      "tokens.json"
    );
  }

  async register(user: UnregisteredUser): Promise<User> {
    const existingUser = this.users.find((u) => u.username === user.username);
    if (existingUser) {
      throw new UsernameAlreadyTakenException();
    }

    const hashedPassword = await bcrypt.hash(user.clearPassword, 10);

    const newUser = new User({
      id: user.id,
      username: user.username,
      hashedPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    this.users.insert(newUser.getState());
    return newUser;
  }

  async login(username: string, password: string): Promise<User> {
    const entry = this.users.find(
      (u) =>
        u.username === username &&
        bcrypt.compareSync(password, u.hashedPassword)
    );

    if (!entry) {
      throw new InvalidCredentialsException();
    }

    return new User(entry);
  }

  async createAPIToken(token: APIToken): Promise<void> {
    this.tokens.insert(FSDB_APITokenMapper.toFSDB(token));
  }

  async updateAPIToken(token: APIToken): Promise<void> {
    this.tokens.rewrite(
      (t) => t.id === token.id,
      FSDB_APITokenMapper.toFSDB(token)
    );
  }

  async findAPITokenByValue(value: string): Promise<OrNull<APIToken>> {
    const token = this.tokens.find((t) => t.value === value);
    if (!token) {
      return null;
    }

    const user = this.users.find((u) => u.id === token.userId);
    if (!user) {
      return null;
    }

    return FSDB_APITokenMapper.toEntity(token, user);
  }

  async createAccessToken(apiToken: APIToken): Promise<AccessToken> {
    const now = this.dateProvider.now();
    const expiresAt = addSeconds(now, this.config.getAccessTokenValidityTime());
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

type FSDB_User = ExtractState<User>;
type FSDB_APIToken = {
  id: string;
  userId: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
};

class FSDB_UserMapper {
  static toEntity(user: FSDB_User): User {
    return new User(user);
  }

  static toFSDB(user: User): FSDB_User {
    return user.getState();
  }
}

class FSDB_APITokenMapper {
  static toEntity(token: FSDB_APIToken, user: FSDB_User): APIToken {
    return new APIToken({
      id: token.id,
      user: FSDB_UserMapper.toEntity(user),
      value: token.value,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      expired: token.expired,
    });
  }

  static toFSDB(token: APIToken): FSDB_APIToken {
    return {
      id: token.id,
      userId: token.user.id,
      value: token.value,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      expired: token.expired,
    };
  }
}
