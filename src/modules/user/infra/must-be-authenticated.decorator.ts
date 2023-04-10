import { interfaces } from "inversify-express-utils";
import { UnauthorizedException } from "../../../shared/errors";

export function mustBeAuthenticated() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const context = (this as any).httpContext as interfaces.HttpContext;
      if (!context) {
        console.warn(
          "The HTTP context is unavailable from the controller. Please extend BaseController."
        );

        return originalMethod.apply(this, args);
      }

      const isAuthenticated = await context.user.isAuthenticated();
      if (!isAuthenticated) {
        throw new UnauthorizedException(
          "You must be authenticated to do this.",
          "not-authenticated"
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
