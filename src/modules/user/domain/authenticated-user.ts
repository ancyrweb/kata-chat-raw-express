type Data = {
  userId: string;
  username: string;
};

/**
 * A user created from an Access Token
 */
export class AuthenticatedUser {
  constructor(private readonly data: Data) {}

  get userId() {
    return this.data.userId;
  }

  get username() {
    return this.data.username;
  }
}
