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

const container = new Container();
container.bind(I_DATE_PROVIDER).to(SystemDateProvider);
container.bind(I_ID_PROVIDER).to(SystemIDProvider);
container.bind(I_RANDOM_PROVIDER).to(SystemRandomProvider);
container.bind(I_AUTH_REPOSITORY).to(InMemoryAuthRepository);

container.bind(CoreService).toSelf();

container.bind(RegisterUseCase).toSelf();
container.bind(LoginUseCase).toSelf();

export const getContainer = () => {
  return container;
};
