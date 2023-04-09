export class ErrorUtils {
  static forceError(e: unknown) {
    if (e instanceof Error) {
      return e;
    }

    return new Error("An unknown error occured");
  }
}

export class AppException extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export class BadClientException extends AppException {
  constructor(message: string, code: string) {
    super(message, 400, code);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, code: string) {
    super(message, 400, code);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string, code: string) {
    super(message, 401, code);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string, code: string) {
    super(message, 403, code);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string, code: string) {
    super(message, 404, code);
  }
}

export class ConflictException extends AppException {
  constructor(message: string, code: string) {
    super(message, 409, code);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(message: string, code: string) {
    super(message, 500, code);
  }
}
