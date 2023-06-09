import { inject } from "inversify";
import { Result, ResultUtils } from "../../../../shared/result";
import { AbstractUseCase } from "../../../../shared/use-case";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import {
  IIDProvider,
  I_ID_PROVIDER,
} from "../../../core/domain/ports/id-provider.interface";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { Message } from "../entity/message";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "../ports/room.repository-interface";
import {
  AppEvent,
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../../core/domain/ports/event-dispatcher.interface";
import { MessageOwner } from "../entity/message-owner";
import { NotFoundException } from "../../../../shared/errors";

type Input = {
  roomId: string;
  requester: AuthenticatedUser;
  content: string;
};

type Output = Message;

export class SendMessageUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_ID_PROVIDER) private readonly idProvider: IIDProvider,
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository
  ) {
    super();
  }

  async handle(data: Input): Promise<Result<Message>> {
    const room = await this.roomRepository.findById(data.roomId);
    if (!room) {
      return ResultUtils.fail(new NotFoundException("Room not found"));
    }

    const message = new Message({
      id: this.idProvider.generate(),
      roomId: data.roomId,
      content: data.content,
      createdAt: this.dateProvider.now(),
      owner: new MessageOwner({
        id: data.requester.userId,
        username: data.requester.username,
      }),
    });

    await this.roomRepository.createMessage(message);

    this.eventDispatcher.raise(
      new MessageSentEvent({
        roomId: data.roomId,
        userId: data.requester.userId,
        messageId: message.id,
        date: message.createdAt,
      })
    );

    return ResultUtils.ok(message);
  }
}

export class MessageSentEvent extends AppEvent<{
  roomId: string;
  userId: string;
  messageId: string;
  date: Date;
}>(Symbol("MessageSentEvent")) {}
