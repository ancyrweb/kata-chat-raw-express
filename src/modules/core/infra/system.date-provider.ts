import { injectable } from "inversify";
import { IDateProvider } from "../domain/ports/date-provider.interface";

@injectable()
export class SystemDateProvider implements IDateProvider {
  now(): Date {
    return new Date();
  }
}
