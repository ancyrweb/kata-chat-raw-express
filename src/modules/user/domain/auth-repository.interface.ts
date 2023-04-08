import { AppException } from "../../../shared/errors";
import { AuthenticatedUser } from "./authenticated-user";
import { Token } from "./token";
import { UnregisteredUser } from "./unregistered-user";
import { User } from "./user";

export const I_AUTH_REPOSITORY = Symbol("I_AUTH_REPOSITORY");

export interface IAuthRepository {
  register(user: UnregisteredUser): Promise<User>;
  login(username: string, password: string): Promise<User>;

  createToken(token: Token): Promise<void>;
}

export class InvalidCredentialsException extends AppException {
  constructor() {
    super("Invalid credentials", "INVALID_CREDENTIALS");
  }
}
