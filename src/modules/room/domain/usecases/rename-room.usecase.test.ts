import { mock } from "jest-mock-extended";
import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { RenameRoomUseCase, RoomRenamedEvent } from "./rename-room.usecase";
import { IRoomRepository } from "../ports/room.repository-interface";
import { AuthenticatedUser } from "../../../user/domain/authenticated-user";
import { Room } from "../entity/room";
import { RoomOwner } from "../entity/room-owner";
import { ResultUtils } from "../../../../shared/result";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";
describe("Feature: renaming a room", () => {
  describe("Case: renaming a room", () => {
    let useCase: RenameRoomUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      roomId: "1",
      name: "The next name",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      roomRepository = mock<IRoomRepository>({
        findById: jest.fn().mockResolvedValue(
          new Room({
            id: "1",
            name: "My Room",
            owner: new RoomOwner({
              id: "123",
              roomsCreatedAmount: 1,
            }),
            createdAt: new Date("2023-01-01T00:00:00.000"),
            updatedAt: new Date("2023-01-01T00:00:00.000"),
          })
        ),
      });

      eventDispatcher = mock<IEventDispatcher>();

      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T05:00:00.000"),
      });

      useCase = new RenameRoomUseCase(
        dateProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should succeed", async () => {
      const result = await useCase.execute(input);

      expect(result.ok).toBeTruthy();

      const data = ResultUtils.unwrap(result);
      expect(data.name).toEqual("The next name");
      expect(data.updatedAt).toEqual(new Date("2023-01-01T05:00:00.000"));
    });

    it("should call the repository", async () => {
      await useCase.execute(input);
      expect(roomRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should dispatch the event", async () => {
      await useCase.execute(input);
      expect(eventDispatcher.raise).toHaveBeenCalledTimes(1);

      const event: RoomRenamedEvent = eventDispatcher.raise.mock.calls[0][0];
      expect(event.props.roomId).toEqual("1");
      expect(event.props.name).toEqual("The next name");
    });
  });

  describe("Case: the room does not exist", () => {
    let useCase: RenameRoomUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      roomId: "1",
      name: "My Room",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      roomRepository = mock<IRoomRepository>({
        findById: jest.fn().mockResolvedValue(null),
      });

      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });

      useCase = new RenameRoomUseCase(
        dateProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should succeed", async () => {
      const result = await useCase.execute(input);

      expect(result.ok).toBeFalsy();
      const error = ResultUtils.getError(result);

      expect(error.message).toEqual("Room not found");
    });
  });
});
