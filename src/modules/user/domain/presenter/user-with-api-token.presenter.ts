import { injectable } from "inversify";
import { IPresenter, Presented } from "../../../../shared/presenter";
import { UserWithAPIToken } from "../user-with-api-token";
import { UserPresenter } from "./user.presenter";

type Input = UserWithAPIToken;
type Output = {
  user: Presented<UserPresenter>;
  token: {
    value: string;
  };
};

@injectable()
export class UserWithAPITokenPresenter implements IPresenter<Input, Output> {
  constructor(private readonly userPresenter: UserPresenter) {}

  async transform(input: Input): Promise<Output> {
    return {
      user: await this.userPresenter.transform(input.user),
      token: {
        value: input.token.value,
      },
    };
  }
}
