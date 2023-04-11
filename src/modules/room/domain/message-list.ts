import { Message } from "./message";

type Data = {
  messages: Message[];
};

export class MessageList {
  private state: Data;

  constructor(data: Data) {
    this.state = data;
  }

  get messages(): Message[] {
    return this.state.messages;
  }
}
