import { injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import { AuthenticatedUserPrincipal } from "../modules/user/infra/authenticated-user.auth-principal";

@injectable()
export abstract class BaseController implements interfaces.Controller {
  public httpContext: interfaces.HttpContext;

  constructor(httpContext: interfaces.HttpContext) {
    this.httpContext = httpContext;
  }

  protected getUser() {
    return (this.httpContext.user as AuthenticatedUserPrincipal).details();
  }
}
