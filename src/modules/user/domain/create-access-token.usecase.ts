import { inject, injectable } from "inversify";
import { AccessToken } from "./access-token";
import { AbstractUseCase } from "../../../shared/use-case";
import {
  IAuthRepository,
  I_AUTH_REPOSITORY,
} from "./ports/auth-repository.interface";
import { Result, ResultUtils } from "../../../shared/result";
import { NotFoundException } from "../../../shared/errors";
import { TokenExpiredException } from "./api-token";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";
import {
  AppEvent,
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../core/domain/ports/event-dispatcher.interface";

type Input = {
  apiTokenValue: string;
};

type Output = AccessToken;

@injectable()
export class CreateAccessTokenUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_AUTH_REPOSITORY) private readonly auth: IAuthRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Output>> {
    const token = await this.auth.findAPITokenByValue(data.apiTokenValue);
    if (!token) {
      return ResultUtils.fail(new NotFoundException("Invalid API token"));
    }

    if (token.isMarkedAsExpired()) {
      return ResultUtils.fail(new TokenExpiredException());
    }

    if (token.dateExpired(this.dateProvider.now())) {
      token.markAsExpired();
      await this.auth.updateAPIToken(token);
      token.commit();

      return ResultUtils.fail(new TokenExpiredException());
    }

    const accessToken = await this.auth.createAccessToken(token);

    this.eventDispatcher.raise(
      new AccessTokenCreated({ userId: token.user.id })
    );

    return ResultUtils.ok(accessToken);
  }
}

export class AccessTokenCreated extends AppEvent<{
  userId: string;
}>(Symbol("AccessTokenCreatedEvent")) {}
