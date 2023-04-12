import { inject, injectable } from "inversify";
import {
  IEventDispatcher,
  I_EVENT_DISPATCHER,
} from "../../../core/domain/ports/event-dispatcher.interface";
import { MessageSentEvent } from "../../../room/domain/usecases/send-message.usecase";
import {
  ILiveRoomRepository,
  I_LIVE_ROOM_REPOSITORY,
} from "../ports/live-room.repository-interface";

@injectable()
export class LiveRoomUserEventListener {
  constructor(
    @inject(I_EVENT_DISPATCHER)
    eventDispatcher: IEventDispatcher,
    @inject(I_LIVE_ROOM_REPOSITORY)
    private readonly liveRoomRepository: ILiveRoomRepository
  ) {
    eventDispatcher.on(
      MessageSentEvent.eventName,
      this.onMessageSent.bind(this)
    );
  }

  async onMessageSent(event: MessageSentEvent) {
    await this.liveRoomRepository.refresh(event.props.userId);
  }
}
