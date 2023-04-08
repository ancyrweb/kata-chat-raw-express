import { Token } from "./token";
import { User } from "./user";

export class AuthenticatedUser {
  constructor(public user: User, public token: Token) {}
}
