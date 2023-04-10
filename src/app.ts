import "reflect-metadata";
import { Container } from "inversify";

import { BaseKernel } from "./framework/kernel";
import { CoreService } from "./modules/core/domain/app/core.service";
import { I_DATE_PROVIDER } from "./modules/core/domain/ports/date-provider.interface";
import { SystemDateProvider } from "./modules/core/infra/adapters/system.date-provider";
import { I_ID_PROVIDER } from "./modules/core/domain/ports/id-provider.interface";
import { SystemIDProvider } from "./modules/core/infra/adapters/system.id-provider";
import { I_RANDOM_PROVIDER } from "./modules/core/domain/ports/random-provider.interface";
import { SystemRandomProvider } from "./modules/core/infra/adapters/system.random-provider";
import { I_AUTH_REPOSITORY } from "./modules/user/domain/ports/auth-repository.interface";
import { RegisterUseCase } from "./modules/user/domain/register.usecase";
import { LoginUseCase } from "./modules/user/domain/login.usecase";
import { UserPresenter } from "./modules/user/domain/presenter/user.presenter";
import { UserWithAPITokenPresenter } from "./modules/user/domain/presenter/user-with-api-token.presenter";
import { I_LOGGER } from "./modules/core/domain/ports/logger.interface";
import { SystemLogger } from "./modules/core/infra/adapters/system.logger";
import { SystemEventDispatcher } from "./modules/core/infra/adapters/system.event-dispatcher";
import { I_EVENT_DISPATCHER } from "./modules/core/domain/ports/event-dispatcher.interface";
import { I_CONFIG } from "./modules/core/domain/ports/config.interface";
import { SystemConfig } from "./modules/core/infra/adapters/system.config";
import { FSAuthRepository } from "./modules/user/infra/adapters/fs.auth-repository";
import { AccessTokenPresenter } from "./modules/user/domain/presenter/access-token.presenter";
import { CreateAccessTokenUseCase } from "./modules/user/domain/create-access-token.usecase";
import { CreateRoomUseCase } from "./modules/room/domain/create-room.usecase";
import { RoomPresenter } from "./modules/room/domain/presenters/room.presenter";
import { I_ROOM_REPOSITORY } from "./modules/room/domain/ports/room.repository-interface";
import { FSRoomRepository } from "./modules/room/infra/adapters/fs.room-repository";
import { RenameRoomUseCase } from "./modules/room/domain/rename-room.usecase";
import { SendMessageUseCase } from "./modules/room/domain/send-message.usecase";
import { MessagePresenter } from "./modules/room/domain/presenters/message.presenter";

// Controllers
import "./modules/core/domain/app/core.controller";
import "./modules/user/app/auth.controller";
import "./modules/room/app/rooms.controller";

export class App extends BaseKernel {
  public inject(container: Container): void {
    container.bind(I_DATE_PROVIDER).to(SystemDateProvider).inSingletonScope();
    container.bind(I_ID_PROVIDER).to(SystemIDProvider).inSingletonScope();
    container
      .bind(I_RANDOM_PROVIDER)
      .to(SystemRandomProvider)
      .inSingletonScope();
    container.bind(I_LOGGER).to(SystemLogger).inSingletonScope();
    container
      .bind(I_EVENT_DISPATCHER)
      .to(SystemEventDispatcher)
      .inSingletonScope();
    container.bind(I_CONFIG).to(SystemConfig).inSingletonScope();

    container.bind(I_AUTH_REPOSITORY).to(FSAuthRepository).inSingletonScope();

    container.bind(CoreService).toSelf().inSingletonScope();

    // Auth
    container.bind(RegisterUseCase).toSelf().inSingletonScope();
    container.bind(LoginUseCase).toSelf().inSingletonScope();
    container.bind(CreateAccessTokenUseCase).toSelf().inSingletonScope();

    container.bind(UserPresenter).toSelf().inSingletonScope();
    container.bind(UserWithAPITokenPresenter).toSelf().inSingletonScope();
    container.bind(AccessTokenPresenter).toSelf().inSingletonScope();

    // Room
    container.bind(CreateRoomUseCase).toSelf().inSingletonScope();
    container.bind(RenameRoomUseCase).toSelf().inSingletonScope();
    container.bind(SendMessageUseCase).toSelf().inSingletonScope();

    container.bind(RoomPresenter).toSelf().inSingletonScope();
    container.bind(MessagePresenter).toSelf().inSingletonScope();
    container.bind(I_ROOM_REPOSITORY).to(FSRoomRepository).inSingletonScope();
  }
}
