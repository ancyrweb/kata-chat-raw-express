import { addMilliseconds, addMinutes } from "date-fns";
import { IDateProvider } from "../../domain/ports/date-provider.interface";

export class FakeDateProvider implements IDateProvider {
  constructor(private _now: Date = new Date("2023-01-01T00:00:00.000")) {}

  public now(): Date {
    return this._now;
  }

  public addMinutes(minutes: number): void {
    this._now = addMinutes(this._now, minutes);
  }
}
