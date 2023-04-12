import { mock } from "jest-mock-extended";

import { ILiveRoomRepository } from "../ports/live-room.repository-interface";
import { LiveRoomUserEventListener } from "./live-room-user.event-listener";
import { SystemEventDispatcher } from "../../../core/infra/adapters/system.event-dispatcher";
import { MessageSentEvent } from "../../../room/domain/usecases/send-message.usecase";

describe("Feature: updating the user's last action", () => {
  describe("Case: when the user sends a message, its last action date should be updated", () => {
    let listener: LiveRoomUserEventListener;
    let eventDispatcher = new SystemEventDispatcher();
    let liveRoomRepository = mock<ILiveRoomRepository>();

    beforeEach(() => {
      eventDispatcher = new SystemEventDispatcher();
      liveRoomRepository = mock<ILiveRoomRepository>({});

      listener = new LiveRoomUserEventListener(
        eventDispatcher,
        liveRoomRepository
      );
    });

    it("should succeed", async () => {
      await eventDispatcher.raise(
        new MessageSentEvent({
          roomId: "room1",
          userId: "user1",
          messageId: "1",
          date: new Date("2023-01-01T00:00:00.000"),
        })
      );

      expect(liveRoomRepository.refresh).toBeCalledWith("user1");
    });
  });
});
