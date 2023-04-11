import { interfaces } from "inversify-express-utils";
import { AuthenticatedUser } from "../domain/entity/authenticated-user";

export class AuthenticatedUserPrincipal implements interfaces.Principal {
  constructor(private readonly user: AuthenticatedUser) {}

  public async isAuthenticated(): Promise<boolean> {
    return true;
  }

  public async isResourceOwner(resourceId: any): Promise<boolean> {
    return true;
  }

  public async isInRole(role: string): Promise<boolean> {
    return true;
  }

  public details(): AuthenticatedUser {
    return this.user;
  }
}
