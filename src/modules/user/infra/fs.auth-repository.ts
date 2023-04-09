import { inject, injectable } from "inversify";
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

@injectable()
export class FSAuthRepository implements IAuthRepository {
  private users: FSDB<User>;
  private tokens: FSDB<Token>;

  constructor(@inject(I_CONFIG) config: IConfig) {
    this.users = new FSDB<User>(config.getFSDBDirectory(), "users.json");
    this.tokens = new FSDB<Token>(config.getFSDBDirectory(), "tokens.json");
  }

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

    this.users.insert(newUser);
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

  async createToken(token: Token): Promise<void> {
    this.tokens.insert(token);
  }
}
