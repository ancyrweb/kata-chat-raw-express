import "reflect-metadata";
import { Container } from "inversify";
import { CoreService } from "../modules/core/domain/app/core.service";
import { I_DATE_PROVIDER } from "../modules/core/domain/ports/date-provider.interface";
import { SystemDateProvider } from "../modules/core/infra/system.date-provider";
import { I_ID_PROVIDER } from "../modules/core/domain/ports/id-provider.interface";
import { SystemIDProvider } from "../modules/core/infra/system.id-provider";
import { I_RANDOM_PROVIDER } from "../modules/core/domain/ports/random-provider.interface";
import { SystemRandomProvider } from "../modules/core/infra/system.random-provider";
import { I_AUTH_REPOSITORY } from "../modules/user/domain/auth-repository.interface";
import { InMemoryAuthRepository } from "../modules/user/infra/inmemory.auth-repository";
import { RegisterUseCase } from "../modules/user/domain/register.usecase";
import { LoginUseCase } from "../modules/user/domain/login.usecase";
import { UserPresenter } from "../modules/user/domain/presenter/user.presenter";
import { AuthenticatedUserPresenter } from "../modules/user/domain/presenter/authenticated-user.presenter";
import {
  ILogger,
  I_LOGGER,
} from "../modules/core/domain/ports/logger.interface";
import { SystemLogger } from "../modules/core/infra/system.logger";
import { SystemEventDispatcher } from "../modules/core/infra/system.event-dispatcher";
import { I_EVENT_DISPATCHER } from "../modules/core/domain/ports/event-dispatcher.interface";

const container = new Container();
container.bind(I_DATE_PROVIDER).to(SystemDateProvider).inSingletonScope();
container.bind(I_ID_PROVIDER).to(SystemIDProvider).inSingletonScope();
container.bind(I_RANDOM_PROVIDER).to(SystemRandomProvider).inSingletonScope();
container.bind(I_LOGGER).to(SystemLogger).inSingletonScope();
container.bind(I_EVENT_DISPATCHER).to(SystemEventDispatcher).inSingletonScope();

container.bind(I_AUTH_REPOSITORY).to(InMemoryAuthRepository).inSingletonScope();

container.bind(CoreService).toSelf().inSingletonScope();

container.bind(RegisterUseCase).toSelf().inSingletonScope();
container.bind(LoginUseCase).toSelf().inSingletonScope();
container.bind(UserPresenter).toSelf().inSingletonScope();
container.bind(AuthenticatedUserPresenter).toSelf().inSingletonScope();

export const getContainer = () => {
  return container;
};

export const getLogger = () => {
  return container.get<ILogger>(I_LOGGER);
};
