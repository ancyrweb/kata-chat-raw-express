import { ValueObject } from "../../../../shared/value-object";
import { ValidationException } from "../../../../shared/errors";

export class Username extends ValueObject<string> {
  tryValid() {
    if (!this.value || this.value.length === 0) {
      throw new ValidationException(
        "Username cannot be empty",
        "username.empty"
      );
    } else if (this.value.length < 2) {
      throw new ValidationException(
        "Username must be at least 2 characters long",
        "username.too-short"
      );
    } else if (this.value.length > 32) {
      throw new ValidationException(
        "Username cannot be longer than 32 characters",
        "username.too-long"
      );
    }
  }
}
