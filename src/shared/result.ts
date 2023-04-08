export type AlwaysOK<T> = {
  ok: true;
  data: T;
};

export type AlwaysError<T> = {
  ok: false;
  error: T;
};

export type ForceOK<T> = Extract<T, { ok: true }>;
export type ForceError<T> = Extract<T, { ok: false }>;

export type Result<TSuccess = unknown, TError = Error> =
  | AlwaysOK<TSuccess>
  | AlwaysError<TError>;

export class ResultUtils {
  static ok<T>(data: T): AlwaysOK<T> {
    return { ok: true, data };
  }
  static emptyOk(): AlwaysOK<null> {
    return { ok: true, data: null };
  }
  static fail<T>(error: T): AlwaysError<T> {
    return { ok: false, error };
  }
  static asError<S, E>(result: Result<S, E>) {
    return result as ForceError<typeof result>;
  }
  static asOK<S, E>(result: Result<S, E>) {
    return result as ForceOK<typeof result>;
  }
  static getError<S, E>(result: Result<S, E>): E {
    return ResultUtils.asError(result).error;
  }
  static unwrap<S, E>(result: Result<S, E>): S {
    if (result.ok === true) {
      return result.data;
    }

    throw result.error;
  }
}
