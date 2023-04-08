import { injectable } from "inversify";
import {
  IAuthRepository,
  InvalidCredentialsException,
  UsernameAlreadyTakenException,
} from "../domain/auth-repository.interface";
import { Token } from "../domain/token";
import { UnregisteredUser } from "../domain/unregistered-user";
import { User } from "../domain/user";

@injectable()
export class InMemoryAuthRepository implements IAuthRepository {
  private users: User[] = [];
  private tokens: Token[] = [];

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

  async createToken(token: Token): Promise<void> {
    this.tokens.push(token);
  }
}
