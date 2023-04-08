import { IRandomProvider } from "../domain/ports/random-provider.interface";

export class SystemRandomProvider implements IRandomProvider {
  generate(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
