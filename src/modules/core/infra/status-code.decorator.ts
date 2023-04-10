import { interfaces } from "inversify-express-utils";
import express from "express";

export function statusCode(code: number) {
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

      const response = context.response as express.Response;
      response.status(code);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
