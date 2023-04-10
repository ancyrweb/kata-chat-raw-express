import { interfaces } from "inversify-express-utils";

export class GuestUserPrincipal implements interfaces.Principal {
  public async isAuthenticated(): Promise<boolean> {
    return false;
  }

  public async isResourceOwner(resourceId: any): Promise<boolean> {
    return false;
  }

  public async isInRole(role: string): Promise<boolean> {
    return false;
  }

  public details() {
    return null;
  }
}
