import { injectable } from "inversify";
import { IPresenter } from "../../../../shared/presenter";
import { Message } from "../entity/message";

type Output = {
  id: string;
  owner: {
    id: string;
    username: string;
  };
  content: string;
  createdAt: Date;
};

@injectable()
export class MessagePresenter implements IPresenter<Message, Output> {
  public async transform(message: Message): Promise<Output> {
    return {
      id: message.id,
      owner: {
        id: message.owner.id,
        username: message.owner.username,
      },
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
