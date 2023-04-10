import {
  AppException,
  BadClientException,
  NotFoundException,
} from "../../../../shared/errors";
import { AccessToken } from "../access-token";
import { APIToken } from "../api-token";
import { UnregisteredUser } from "../unregistered-user";
import { User } from "../user";
import { OrNull } from "../../../../types";

export const I_AUTH_REPOSITORY = Symbol("I_AUTH_REPOSITORY");

export interface IAuthRepository {
  register(user: UnregisteredUser): Promise<User>;
  login(username: string, password: string): Promise<User>;

  createAPIToken(token: APIToken): Promise<void>;
  updateAPIToken(token: APIToken): Promise<void>;
  findAPITokenByValue(value: string): Promise<OrNull<APIToken>>;
  createAccessToken(apiToken: APIToken): Promise<AccessToken>;
}

export class UsernameAlreadyTakenException extends BadClientException {
  constructor() {
    super("Username already taken", "USERNAME_ALREADY_TAKEN");
  }
}

export class InvalidCredentialsException extends BadClientException {
  constructor() {
    super("Invalid credentials", "INVALID_CREDENTIALS");
  }
}

export class APITokenNotFound extends NotFoundException {}

export class APITokenExpiredException extends AppException {}
