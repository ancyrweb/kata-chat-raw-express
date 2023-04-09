import { diff } from "deep-object-diff";

type Identifiable = {
  id: string;
};

export abstract class AbstractEntity<T extends Identifiable> {
  private initialState: T;
  protected state: T;

  constructor(data: T) {
    this.initialState = data;
    this.state = { ...data };

    Object.freeze(this.initialState);
  }

  protected setState(data: Partial<T>) {
    this.state = {
      ...this.state,
      ...data,
    };
  }

  getState() {
    return this.state;
  }

  getDiff(): Partial<T> {
    return diff(this.initialState, this.state);
  }

  get id() {
    return this.state.id;
  }
}

export type ExtractState<T> = T extends AbstractEntity<infer U> ? U : never;
