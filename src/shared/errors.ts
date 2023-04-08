export class ErrorUtils {
  static forceError(e: unknown) {
    if (e instanceof Error) {
      return e;
    }

    return new Error("An unknown error occured");
  }
}

export class AppException extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}
