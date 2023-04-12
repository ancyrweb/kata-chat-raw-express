import { AbstractUseCase } from "../../../../shared/use-case";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { Result, ResultUtils } from "../../../../shared/result";
import { inject } from "inversify";
import {
  ILiveRoomRepository,
  I_LIVE_ROOM_REPOSITORY,
} from "../adapters/live-room.repository-interface";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../../../room/domain/ports/room.repository-interface";
import {
  IEventDispatcher,
  I_EVENT_DISPATCHER,
  AppEvent,
} from "../../../core/domain/ports/event-dispatcher.interface";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import { NotFoundException } from "../../../../shared/errors";

type Input = {
  roomId: string;
  requester: AuthenticatedUser;
};

type Output = null;

export class LeaveRoomUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository,
    @inject(I_LIVE_ROOM_REPOSITORY)
    private readonly liveRoomRepository: ILiveRoomRepository
  ) {
    super();
  }

  async handle(input: Input): Promise<Result<Output>> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new NotFoundException("Room not found");
    }

    await this.liveRoomRepository.leaveRoom(room, input.requester.userId);

    this.eventDispatcher.raise(
      new UserLeftRoomEvent({
        userId: input.requester.userId,
        roomId: room.id,
        date: this.dateProvider.now(),
      })
    );

    return ResultUtils.emptyOk();
  }
}

export class UserLeftRoomEvent extends AppEvent<{
  userId: string;
  roomId: string;
  date: Date;
}>(Symbol("UserLeftRoomEvent")) {}
