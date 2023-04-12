import { IDateProvider } from "../../domain/ports/date-provider.interface";

export class FakeDateProvider implements IDateProvider {
  constructor(
    private readonly _now: Date = new Date("2023-01-01T00:00:00.000")
  ) {}

  public now(): Date {
    return this._now;
  }
}
