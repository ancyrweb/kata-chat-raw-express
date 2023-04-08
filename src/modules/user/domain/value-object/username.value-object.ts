import { String } from "runtypes";
import { ValueObject } from "../../../../shared/value-object";

export class Username extends ValueObject<string> {
  tryValid() {
    if (this.value.length === 0) {
      throw new Error("Username cannot be empty");
    } else if (this.value.length < 2) {
      throw new Error("Username must be at least 2 characters long");
    } else if (this.value.length > 32) {
      throw new Error("Username cannot be longer than 32 characters");
    }
  }
}
