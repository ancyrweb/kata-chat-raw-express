import { mock } from "jest-mock-extended";
import { IRoomRepository } from "../ports/room.repository-interface";
import { CreateRoomUseCase, RoomCreatedEvent } from "./create-room.usecase";
import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { IIDProvider } from "../../../core/domain/ports/id-provider.interface";
import { RoomOwner } from "../entity/room-owner";
import { ResultUtils } from "../../../../shared/result";
import { AuthenticatedUser } from "../../../user/domain/authenticated-user";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";

describe("Feature: creating a room", () => {
  describe("Case: creating a room", () => {
    let useCase: CreateRoomUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      name: "My Room",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });

      roomRepository = mock<IRoomRepository>({
        findRoomOwnerById: jest.fn().mockResolvedValue(
          new RoomOwner({
            id: "123",
            roomsCreatedAmount: 0,
          })
        ),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateRoomUseCase(
        idProvider,
        dateProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should succeed", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeTruthy();

      const data = ResultUtils.asOK(result).data;
      expect(data.id).toEqual("1");
      expect(data.name).toEqual("My Room");
      expect(data.owner.id).toEqual("123");
      expect(data.owner.roomsCreatedAmount).toEqual(1);
    });

    it("should persist", async () => {
      await useCase.execute(input);
      expect(roomRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should dispatch an event", async () => {
      await useCase.execute(input);
      expect(eventDispatcher.raise).toHaveBeenCalledTimes(1);

      const event: RoomCreatedEvent = eventDispatcher.raise.mock.calls[0][0];
      expect(event.props.roomId).toBe("1");
    });
  });

  describe("Case: creating a room when the client does not exist", () => {
    let useCase: CreateRoomUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      name: "My Room",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      eventDispatcher = mock<IEventDispatcher>();

      roomRepository = mock<IRoomRepository>({
        findRoomOwnerById: jest.fn().mockResolvedValue(null),
      });

      useCase = new CreateRoomUseCase(
        idProvider,
        dateProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should return an error", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeFalsy();

      const error = ResultUtils.getError(result);
      expect(error.message).toEqual("Owner not found");
    });

    it("should NOT persist", async () => {
      await useCase.execute(input);
      expect(roomRepository.create).toHaveBeenCalledTimes(0);
    });
  });

  describe("Case: creating a room when the client can no longer create new rooms", () => {
    let useCase: CreateRoomUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      name: "My Room",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      roomRepository = mock<IRoomRepository>({
        findRoomOwnerById: jest.fn().mockResolvedValue(
          new RoomOwner({
            id: "123",
            roomsCreatedAmount: RoomOwner.MAX_AMOUNT_OF_ROOMS + 1,
          })
        ),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateRoomUseCase(
        idProvider,
        dateProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should return an error", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeFalsy();

      const error = ResultUtils.getError(result);
      expect(error.message).toEqual("Exceeded max amount of rooms");
    });

    it("should NOT persist", async () => {
      await useCase.execute(input);
      expect(roomRepository.create).toHaveBeenCalledTimes(0);
    });
  });
});
