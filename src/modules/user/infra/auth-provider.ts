import express from "express";
import { inject, injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../domain/ports/auth-repository.interface";
import { AuthenticatedUserPrincipal } from "./authenticated-user.auth-principal";
import { GuestUserPrincipal } from "./guest-user.auth-principal";
import { ErrorUtils } from "../../../shared/errors";

export const I_INFRA_AUTH_PROVIDER = Symbol("I_INFRA_AUTH_PROVIDER");

@injectable()
export class AuthProvider implements interfaces.AuthProvider {
  constructor(
    @inject(I_AUTH_REPOSITORY) private readonly authRepository: IAuthRepository
  ) {}

  async getUser(req: express.Request): Promise<interfaces.Principal> {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return new GuestUserPrincipal();
      }

      const user = await this.authRepository.authenticate(accessToken);
      if (!user) {
        return new GuestUserPrincipal();
      }

      return new AuthenticatedUserPrincipal(user);
    } catch (e) {
      return Promise.reject(ErrorUtils.forceError(e));
    }
  }
}
