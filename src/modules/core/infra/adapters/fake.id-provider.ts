import { IIDProvider } from "../../domain/ports/id-provider.interface";

export class FakeIdProvider implements IIDProvider {
  constructor(private readonly _id: string = "1") {}

  public generate(): string {
    return this._id;
  }

  public getId() {
    return this._id;
  }
}
