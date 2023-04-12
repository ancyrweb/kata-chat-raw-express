import { mock } from "jest-mock-extended";
import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { IRoomRepository } from "../ports/room.repository-interface";
import { AuthenticatedUser } from "../../../user/domain/entity/authenticated-user";
import { Room } from "../entity/room";
import { RoomOwner } from "../entity/room-owner";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";
import { MessageSentEvent, SendMessageUseCase } from "./send-message.usecase";
import { IIDProvider } from "../../../core/domain/ports/id-provider.interface";
import { ResultUtils } from "../../../../shared/result";
describe("Feature: sending a message", () => {
  describe("Case: sending a message", () => {
    let useCase: SendMessageUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      roomId: "1",
      content: "Oh my gah !",
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

      const idProvider = mock<IIDProvider>({
        generate: () => "1",
      });

      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });

      useCase = new SendMessageUseCase(
        dateProvider,
        idProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should succeed", async () => {
      const result = await useCase.execute(input);

      expect(result.ok).toBeTruthy();

      const data = ResultUtils.unwrap(result);
      expect(data.content).toEqual("Oh my gah !");
      expect(data.owner.id).toEqual("123");
      expect(data.owner.username).toEqual("john");
    });

    it("should save the message", async () => {
      await useCase.execute(input);

      expect(roomRepository.createMessage).toHaveBeenCalledTimes(1);
    });

    it("should raise an event", async () => {
      await useCase.execute(input);

      expect(eventDispatcher.raise).toHaveBeenCalledTimes(1);

      const event: MessageSentEvent = eventDispatcher.raise.mock.calls[0][0];
      expect(event.props.roomId).toEqual("1");
      expect(event.props.messageId).toEqual("1");
    });
  });

  describe("Case: sending a message when the room does not exist", () => {
    let useCase: SendMessageUseCase;
    let roomRepository: IRoomRepository;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const input = {
      roomId: "1",
      content: "Oh my gah !",
      requester: new AuthenticatedUser({
        userId: "123",
        username: "john",
      }),
    };

    beforeEach(() => {
      roomRepository = mock<IRoomRepository>({
        findById: jest.fn().mockResolvedValue(null),
      });
      eventDispatcher = mock<IEventDispatcher>();
      const idProvider = mock<IIDProvider>({
        generate: () => "1",
      });

      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });

      useCase = new SendMessageUseCase(
        dateProvider,
        idProvider,
        eventDispatcher,
        roomRepository
      );
    });

    it("should fail", async () => {
      const result = await useCase.execute(input);
      expect(result.ok).toBeFalsy();
    });

    it("should not raise an event", async () => {
      const result = useCase.execute(input);
      expect(eventDispatcher.raise).toHaveBeenCalledTimes(0);
    });
  });
});
