import { injectable } from "inversify";
import EventEmitter from "eventemitter2";

import {
  IEvent,
  IEventDispatcher,
} from "../../domain/ports/event-dispatcher.interface";

@injectable()
export class SystemEventDispatcher implements IEventDispatcher {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  raise(event: IEvent<any>): void {
    this.emitter.emit(event.eventName, event);
  }

  on(name: symbol, handler: (event: IEvent<any>) => void): void {
    this.emitter.on(name, handler);
  }
}
