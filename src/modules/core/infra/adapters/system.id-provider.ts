import { injectable } from "inversify";
import { v4 } from "uuid";
import { IIDProvider } from "../../domain/ports/id-provider.interface";

@injectable()
export class SystemIDProvider implements IIDProvider {
  generate(): string {
    return v4();
  }
}
