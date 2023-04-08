import { String } from "runtypes";
import { ValueObject } from "../../../../shared/value-object";

export class PlainPassword extends ValueObject<string> {
  tryValid() {
    if (this.value.length === 0) {
      throw new Error("Password cannot be empty");
    } else if (this.value.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    } else if (this.value.length > 32) {
      throw new Error("Password cannot be longer than 32 characters");
    }
  }
}
