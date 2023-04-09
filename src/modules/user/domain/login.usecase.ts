import { inject, injectable } from "inversify";
import { addMonths } from "date-fns";

import { AbstractUseCase } from "../../../shared/use-case";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "./auth-repository.interface";
import { Token } from "./token";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";
import {
  IIDProvider,
  I_ID_PROVIDER,
} from "../../core/domain/ports/id-provider.interface";
import { Result, ResultUtils } from "../../../shared/result";
import { AuthenticatedUser } from "./authenticated-user";
import {
  IRandomProvider,
  I_RANDOM_PROVIDER,
} from "../../core/domain/ports/random-provider.interface";

type Input = {
  username: string;
  password: string;
};

type Output = AuthenticatedUser;

@injectable()
export class LoginUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_ID_PROVIDER) private readonly idProvider: IIDProvider,
    @inject(I_RANDOM_PROVIDER) private readonly randomProvider: IRandomProvider,
    @inject(I_AUTH_REPOSITORY)
    private readonly auth: IAuthRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Output>> {
    const user = await this.auth.login(data.username, data.password);

    const token = new Token({
      id: this.idProvider.generate(),
      userId: user.id,
      value: this.randomProvider.generate(),
      createdAt: this.dateProvider.now(),
      expiresAt: addMonths(this.dateProvider.now(), 3),
      expired: false,
    });

    await this.auth.createToken(token);
    return ResultUtils.ok(new AuthenticatedUser(user, token));
  }
}
