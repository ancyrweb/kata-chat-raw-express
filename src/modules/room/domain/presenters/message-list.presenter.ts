import { injectable } from "inversify";
import { IPresenter } from "./../../../../shared/presenter";
import { MessageList } from "../message-list";

type Input = MessageList;
type Output = {
  messages: {
    id: string;
    roomId: string;
    owner: {
      id: string;
      username: string;
    };
    content: string;
    createdAt: Date;
  }[];
};

@injectable()
export class MessageListPresenter implements IPresenter<Input, Output> {
  async transform(input: Input): Promise<Output> {
    return {
      messages: input.messages.map((message) => ({
        id: message.id,
        roomId: message.roomId,
        owner: {
          id: message.owner.id,
          username: message.owner.username,
        },
        content: message.content,
        createdAt: message.createdAt,
      })),
    };
  }
}
