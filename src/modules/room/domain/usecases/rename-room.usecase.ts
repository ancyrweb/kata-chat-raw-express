import { Result, ResultUtils } from "../../../../shared/result";
import { AbstractUseCase } from "../../../../shared/use-case";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { Room } from "../entity/room";
import { inject } from "inversify";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../ports/room.repository-interface";
import { NotFoundException } from "../../../../shared/errors";
import {
  AppEvent,
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../../core/domain/ports/event-dispatcher.interface";

type Input = {
  roomId: string;
  name: string;
  requester: AuthenticatedUser;
};

type Output = Room;

export class RenameRoomUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Output>> {
    const room = await this.roomRepository.findById(data.roomId);
    if (!room) {
      return ResultUtils.fail(new NotFoundException("Room not found"));
    }

    room.rename(data.name, this.dateProvider.now());
    await this.roomRepository.update(room);
    room.commit();

    this.eventDispatcher.raise(
      new RoomRenamedEvent({ roomId: room.id, name: room.name })
    );

    return ResultUtils.ok(room);
  }
}

export class RoomRenamedEvent extends AppEvent<{
  roomId: string;
  name: string;
}>(Symbol("RoomRenamedEvent")) {}
