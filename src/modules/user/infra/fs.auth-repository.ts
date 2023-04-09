import { inject, injectable } from "inversify";
import bcrypt from "bcrypt";

import {
  IAuthRepository,
  InvalidCredentialsException,
  UsernameAlreadyTakenException,
} from "../domain/auth-repository.interface";
import { Token } from "../domain/token";
import { UnregisteredUser } from "../domain/unregistered-user";
import { User } from "../domain/user";
import { FSDB } from "../../../shared/fsdb";
import { IConfig, I_CONFIG } from "../../core/domain/ports/config.interface";
import { ExtractState } from "../../../shared/entity";

@injectable()
export class FSAuthRepository implements IAuthRepository {
  private users: FSDB<ExtractState<User>>;
  private tokens: FSDB<ExtractState<Token>>;

  constructor(@inject(I_CONFIG) config: IConfig) {
    this.users = new FSDB<User>(config.getFSDBDirectory(), "users.json");
    this.tokens = new FSDB<Token>(config.getFSDBDirectory(), "tokens.json");
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

  async createToken(token: Token): Promise<void> {
    this.tokens.insert(token);
  }
}
