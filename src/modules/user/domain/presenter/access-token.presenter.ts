import { injectable } from "inversify";
import { IPresenter } from "../../../../shared/presenter";
import { AccessToken } from "../entity/access-token";

type Input = AccessToken;
type Output = {
  value: string;
  expiresAt: Date;
};

@injectable()
export class AccessTokenPresenter implements IPresenter<Input, Output> {
  async transform(input: Input): Promise<Output> {
    return {
      value: input.value,
      expiresAt: input.expiresAt,
    };
  }
}
