export abstract class ValueObject<T> {
  constructor(protected value: T) {}

  abstract tryValid(): void;

  check() {
    this.tryValid();
    return this.value;
  }
}
