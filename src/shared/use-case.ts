import { injectable } from "inversify";
import { ErrorUtils } from "./errors";
import { Result, ResultUtils } from "./result";

@injectable()
export abstract class AbstractUseCase<TInput, TOutput> {
  abstract handle(data: TInput): Promise<Result<TOutput>>;

  async execute(data: TInput): Promise<Result<TOutput>> {
    try {
      const result = await this.handle(data);
      return result;
    } catch (e) {
      return ResultUtils.fail(ErrorUtils.forceError(e));
    }
  }
}
