import { mock } from "jest-mock-extended";
import { subHours } from "date-fns";

import { FakeDateProvider } from "../../../core/infra/adapters/fake.date-provider";
import { ILiveRoomRepository } from "../adapters/live-room.repository-interface";
import { LiveRoomUserEventListener } from "./live-room-user.event-listener";
import { SystemEventDispatcher } from "../../../core/infra/adapters/system.event-dispatcher";
import { MessageSentEvent } from "../../../room/domain/usecases/send-message.usecase";
import { LiveRoomUser } from "../entity/live-room-user";

describe("Feature: updating the user's last action", () => {
  describe("Case: when the user sends a message, its last action date should be updated", () => {
    let listener: LiveRoomUserEventListener;
    let dateProvider = new FakeDateProvider();
    let eventDispatcher = new SystemEventDispatcher();
    let liveRoomRepository = mock<ILiveRoomRepository>();

    beforeEach(() => {
      dateProvider = new FakeDateProvider();
      eventDispatcher = new SystemEventDispatcher();
      liveRoomRepository = mock<ILiveRoomRepository>({
        findLiveRoomUser: jest.fn().mockResolvedValue(
          new LiveRoomUser({
            id: "room1-user1",
            roomId: "room1",
            userId: "user1",
            lastActionAt: subHours(dateProvider.now(), 1),
          })
        ),
      });

      listener = new LiveRoomUserEventListener(
        eventDispatcher,
        dateProvider,
        liveRoomRepository
      );
    });

    it("should succeed", async () => {
      await eventDispatcher.raise(
        new MessageSentEvent({
          roomId: "room1",
          userId: "user1",
          messageId: "1",
          date: dateProvider.now(),
        })
      );

      expect(liveRoomRepository.findLiveRoomUser).toBeCalledWith(
        "room1",
        "user1"
      );

      const liveRoom = liveRoomRepository.update.mock
        .calls[0][0] as LiveRoomUser;

      expect(liveRoom.getState()).toEqual({
        id: "room1-user1",
        roomId: "room1",
        userId: "user1",
        lastActionAt: dateProvider.now(),
      });
    });
  });
});
