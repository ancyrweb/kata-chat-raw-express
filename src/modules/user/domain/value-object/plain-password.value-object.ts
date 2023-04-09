import { ValueObject } from "../../../../shared/value-object";
import { ValidationException } from "../../../../shared/errors";

export class PlainPassword extends ValueObject<string> {
  tryValid() {
    if (!this.value || this.value.length === 0) {
      throw new ValidationException(
        "Password cannot be empty",
        "password.empty"
      );
    } else if (this.value.length < 6) {
      throw new ValidationException(
        "Password must be at least 6 characters long",
        "password.too-short"
      );
    } else if (this.value.length > 32) {
      throw new ValidationException(
        "Password cannot be longer than 32 characters",
        "password.too-long"
      );
    }
  }
}
