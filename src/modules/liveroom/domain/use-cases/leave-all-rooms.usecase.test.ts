import { mock } from "jest-mock-extended";
import { ILiveRoomRepository } from "../ports/live-room.repository-interface";
import {
  LeaveAllRoomsUseCase,
  UserLeftAllRoomsEvent,
} from "./leave-all-rooms.usecase";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { FakeDateProvider } from "../../../core/infra/adapters/fake.date-provider";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";

describe("Feature: leaving all the rooms", () => {
  describe("Case: user leaves all the rooms", () => {
    let useCase: LeaveAllRoomsUseCase;
    let dateProvider: FakeDateProvider;
    let eventDispatcher = mock<IEventDispatcher>();
    let liveRoomRepository = mock<ILiveRoomRepository>();

    beforeEach(() => {
      dateProvider = new FakeDateProvider();
      eventDispatcher = mock<IEventDispatcher>();
      liveRoomRepository = mock<ILiveRoomRepository>();
      useCase = new LeaveAllRoomsUseCase(
        dateProvider,
        eventDispatcher,
        liveRoomRepository
      );
    });

    it("should leave all the rooms", async () => {
      const result = await useCase.execute({
        requester: new AuthenticatedUser({
          userId: "user1",
          username: "user1",
        }),
      });

      expect(result).toBeTruthy();
      expect(liveRoomRepository.leaveAll).toBeCalledWith("user1");
    });

    it("should raise an event", async () => {
      const result = await useCase.execute({
        requester: new AuthenticatedUser({
          userId: "user1",
          username: "user1",
        }),
      });

      expect(eventDispatcher.raise).toBeCalledWith(
        new UserLeftAllRoomsEvent({
          userId: "user1",
          date: dateProvider.now(),
        })
      );
    });
  });
});
