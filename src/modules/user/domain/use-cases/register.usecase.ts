import { inject, injectable } from "inversify";
import { Result, ResultUtils } from "../../../../shared/result";
import { AbstractUseCase } from "../../../../shared/use-case";
import { UnregisteredUser } from "../entity/unregistered-user";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import {
  IIDProvider,
  I_ID_PROVIDER,
} from "../../../core/domain/ports/id-provider.interface";
import { Username } from "../value-object/username.value-object";
import { PlainPassword } from "../value-object/plain-password.value-object";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "../ports/auth-repository.interface";
import { User } from "../entity/user";

type Input = {
  username: string;
  password: string;
};

type Output = {
  user: User;
};

@injectable()
export class RegisterUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_ID_PROVIDER) private readonly idProvider: IIDProvider,
    @inject(I_AUTH_REPOSITORY) private readonly auth: IAuthRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Output>> {
    const unregisteredUser = new UnregisteredUser({
      id: this.idProvider.generate(),
      username: new Username(data.username).check(),
      clearPassword: new PlainPassword(data.password).check(),
      createdAt: this.dateProvider.now(),
      updatedAt: this.dateProvider.now(),
    });

    const user = await this.auth.register(unregisteredUser);

    return ResultUtils.ok({ user });
  }
}
