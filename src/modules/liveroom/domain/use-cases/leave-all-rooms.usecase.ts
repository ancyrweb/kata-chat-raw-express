import { inject } from "inversify";
import { Result, ResultUtils } from "../../../../shared/result";
import { AbstractUseCase } from "../../../../shared/use-case";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import {
  ILiveRoomRepository,
  I_LIVE_ROOM_REPOSITORY,
} from "../ports/live-room.repository-interface";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import {
  AppEvent,
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../../core/domain/ports/event-dispatcher.interface";

type Input = {
  requester: AuthenticatedUser;
};

type Output = null;

export class LeaveAllRoomsUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private dateProvider: IDateProvider,
    @inject(I_EVENT_DISPATCHER) private eventDispatcher: IEventDispatcher,
    @inject(I_LIVE_ROOM_REPOSITORY)
    private liveRoomRepository: ILiveRoomRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<null>> {
    await this.liveRoomRepository.leaveAll(data.requester.userId);

    this.eventDispatcher.raise(
      new UserLeftAllRoomsEvent({
        userId: data.requester.userId,
        date: this.dateProvider.now(),
      })
    );

    return ResultUtils.emptyOk();
  }
}

export class UserLeftAllRoomsEvent extends AppEvent<{
  userId: string;
  date: Date;
}>(Symbol("UserLeftAllRoomsEvent")) {}
