export interface IEvent<Props> {
  eventName: symbol;
  props: Props;
}

export const AppEvent = <Props>(eventName: symbol) =>
  class AppEventImpl implements IEvent<Props> {
    static eventName = eventName;
    readonly eventName = eventName;
    constructor(readonly props: Props) {}
  };

export const I_EVENT_DISPATCHER = Symbol("IEventDispatcher");

export interface IEventDispatcher {
  raise(event: IEvent<any>): void;
  on(name: symbol, handler: (event: IEvent<any>) => void): void;
}
