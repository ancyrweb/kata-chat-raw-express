import { APIToken } from "./api-token";
import { User } from "./user";

export class UserWithAPIToken {
  constructor(public user: User, public token: APIToken) {}
}
