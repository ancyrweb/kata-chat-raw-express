import { inject, injectable } from "inversify";
import { Room } from "./room";
import {
  IIDProvider,
  I_ID_PROVIDER,
} from "../../core/domain/ports/id-provider.interface";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../core/domain/ports/date-provider.interface";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "./ports/room.repository-interface";
import { Result, ResultUtils } from "../../../shared/result";
import { AbstractUseCase } from "../../../shared/use-case";
import { NotFoundException } from "../../../shared/errors";
import { AuthenticatedUser } from "../../user/domain/authenticated-user";
import {
  AppEvent,
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../core/domain/ports/event-dispatcher.interface";

type Input = {
  name: string;
  requester: AuthenticatedUser;
};

type Output = Room;

@injectable()
export class CreateRoomUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_ID_PROVIDER) private readonly idProvider: IIDProvider,
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Output>> {
    const owner = await this.roomRepository.findRoomOwnerById(
      data.requester.userId
    );

    if (!owner) {
      return ResultUtils.fail(new OwnerNotFoundException());
    }

    owner.tryToReserveRoom();

    const room = new Room({
      id: this.idProvider.generate(),
      name: data.name,
      owner: owner!,
      createdAt: this.dateProvider.now(),
      updatedAt: this.dateProvider.now(),
    });

    await this.roomRepository.create(room);
    owner.commit();

    this.eventDispatcher.raise(new RoomCreatedEvent({ roomId: room.id }));
    return ResultUtils.ok(room);
  }
}

export class OwnerNotFoundException extends NotFoundException {
  constructor() {
    super("Owner not found");
  }
}

export class RoomCreatedEvent extends AppEvent<{
  roomId: string;
}>(Symbol("RoomCreatedEvent")) {}
