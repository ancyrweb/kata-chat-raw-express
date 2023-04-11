import { inject } from "inversify";
import { AbstractUseCase } from "../../../shared/use-case";
import { AuthenticatedUser } from "../../user/domain/authenticated-user";
import { MessageList } from "./message-list";
import {
  IRoomRepository,
  I_ROOM_REPOSITORY,
} from "./ports/room.repository-interface";
import { Result, ResultUtils } from "../../../shared/result";

type Input = {
  roomId: string;
};

type Output = MessageList;

export class GetMessagesUseCase extends AbstractUseCase<Input, Output> {
  constructor(
    @inject(I_ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository
  ) {
    super();
  }

  async handle(input: Input): Promise<Result<Output>> {
    const { roomId } = input;
    const messageList = await this.roomRepository.findMessagesByRoomId(roomId);
    return ResultUtils.ok(messageList);
  }
}
