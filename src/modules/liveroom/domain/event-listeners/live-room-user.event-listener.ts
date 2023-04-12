import { inject, injectable } from "inversify";
import {
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../../core/domain/ports/event-dispatcher.interface";
import { MessageSentEvent } from "../../../room/domain/usecases/send-message.usecase";
import {
  IDateProvider,
  I_DATE_PROVIDER,
} from "../../../core/domain/ports/date-provider.interface";
import {
  ILiveRoomRepository,
  I_LIVE_ROOM_REPOSITORY,
} from "../adapters/live-room.repository-interface";

@injectable()
export class LiveRoomUserEventListener {
  constructor(
    @inject(I_EVENT_DISPATCHER)
    private readonly eventDispatcher: IEventDispatcher,
    @inject(I_DATE_PROVIDER) private readonly dateProvider: IDateProvider,
    @inject(I_LIVE_ROOM_REPOSITORY)
    private readonly liveRoomRepository: ILiveRoomRepository
  ) {
    eventDispatcher.on(
      MessageSentEvent.eventName,
      this.onMessageSent.bind(this)
    );
  }

  async onMessageSent(event: MessageSentEvent) {
    const liveRoom = await this.liveRoomRepository.findLiveRoomUser(
      event.props.roomId,
      event.props.userId
    );

    // The user didn't join the room
    // TODO : have the user join the room when it happens
    // TODO : have the user leave the room if it didn't have any activity for a while
    if (!liveRoom) {
      return;
    }

    liveRoom.makeAction(this.dateProvider.now());
    await this.liveRoomRepository.update(liveRoom);
  }
}
