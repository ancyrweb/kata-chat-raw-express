import { addMonths } from "date-fns";

import { App } from "../../../app";
import { APIToken } from "../domain/api-token";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../domain/ports/auth-repository.interface";
import { UnregisteredUser } from "../domain/unregistered-user";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";
import { UserTestFactory } from "../domain/user";

export class AuthIntegration {
  constructor(private readonly app: App) {}

  async createUserAndAuthenticate(user: UnregisteredUser) {
    const authRepository = this.app
      .getContainer()
      .get<IAuthRepository>(I_AUTH_REPOSITORY);

    const dateProvider = this.app
      .getContainer()
      .get<IDateProvider>(I_DATE_PROVIDER);

    await authRepository.register(user);

    const apiToken = new APIToken({
      id: "1",
      user: UserTestFactory.create({
        id: user.id,
      }),
      value: "123",
      createdAt: dateProvider.now(),
      expiresAt: addMonths(dateProvider.now(), 3),
      expired: false,
    });

    return await authRepository.createAccessToken(apiToken);
  }
}