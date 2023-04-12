import { mock } from "jest-mock-extended";
import { JoinRoomUseCase, UserJoinedRoomEvent } from "./join-room.usecase";
import { ILiveRoomRepository } from "../ports/live-room.repository-interface";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { IRoomRepository } from "../../../room/domain/ports/room.repository-interface";
import { RoomTestFactory } from "../../../room/domain/entity/room";
import { FakeDateProvider } from "../../../core/infra/adapters/fake.date-provider";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";

describe("Feature: joining a room", () => {
  describe("Case: joining a room", () => {
    let useCase: JoinRoomUseCase;
    let dateProvider = new FakeDateProvider();
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;
    let liveRoomRepository = mock<ILiveRoomRepository>();
    let roomRepository = mock<IRoomRepository>();

    const input = {
      roomId: "room1",
      requester: new AuthenticatedUser({
        userId: "user1",
        username: "johndoe",
      }),
    };

    beforeEach(() => {
      dateProvider = new FakeDateProvider();
      eventDispatcher = mock<IEventDispatcher>();
      liveRoomRepository = mock<ILiveRoomRepository>();
      roomRepository = mock<IRoomRepository>({
        findById: jest.fn().mockResolvedValue(
          RoomTestFactory.create({
            id: "room1",
          })
        ),
      });

      useCase = new JoinRoomUseCase(
        dateProvider,
        eventDispatcher,
        roomRepository,
        liveRoomRepository
      );
    });

    it("should succeed", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeTruthy();

      expect(roomRepository.findById).toHaveBeenCalledTimes(1);
      expect(roomRepository.findById).toHaveBeenCalledWith(input.roomId);

      expect(liveRoomRepository.joinRoom).toHaveBeenCalledTimes(1);
    });

    it("should raise an event", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeTruthy();

      expect(eventDispatcher.raise).toHaveBeenCalledTimes(1);
      expect(eventDispatcher.raise).toHaveBeenCalledWith(
        new UserJoinedRoomEvent({
          roomId: "room1",
          userId: "user1",
          date: dateProvider.now(),
        })
      );
    });
  });

  describe("Case: the room does not exist", () => {
    let useCase: JoinRoomUseCase;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;
    let dateProvider = new FakeDateProvider();
    let liveRoomRepository = mock<ILiveRoomRepository>();
    let roomRepository = mock<IRoomRepository>();

    const input = {
      roomId: "room1",
      requester: new AuthenticatedUser({
        userId: "user1",
        username: "johndoe",
      }),
    };

    beforeEach(() => {
      dateProvider = new FakeDateProvider();
      eventDispatcher = mock<IEventDispatcher>();
      liveRoomRepository = mock<ILiveRoomRepository>();
      roomRepository = mock<IRoomRepository>({
        findById: jest.fn().mockResolvedValue(null),
      });

      useCase = new JoinRoomUseCase(
        dateProvider,
        eventDispatcher,
        roomRepository,
        liveRoomRepository
      );
    });

    it("should fail", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeFalsy();

      expect(roomRepository.findById).toHaveBeenCalledTimes(1);
      expect(roomRepository.findById).toHaveBeenCalledWith(input.roomId);

      expect(liveRoomRepository.joinRoom).toHaveBeenCalledTimes(0);
    });

    it("should not raise an event", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeFalsy();

      expect(eventDispatcher.raise).toHaveBeenCalledTimes(0);
    });
  });
});
