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
import { AuthenticatedUser } from "../authenticated-user";

export const I_AUTH_REPOSITORY = Symbol("I_AUTH_REPOSITORY");

export interface IAuthRepository {
  register(user: UnregisteredUser): Promise<User>;
  create(user: User): Promise<void>;
  login(username: string, password: string): Promise<User>;

  createAPIToken(token: APIToken): Promise<void>;
  updateAPIToken(token: APIToken): Promise<void>;
  findAPITokenByValue(value: string): Promise<OrNull<APIToken>>;

  createAccessToken(apiToken: APIToken): Promise<AccessToken>;
  authenticate(value: string): Promise<AuthenticatedUser>;

  findUserById(id: string): Promise<OrNull<User>>;
}

export type AccessTokenPayload = {
  sub: string; // user id
  username: string;
};

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
