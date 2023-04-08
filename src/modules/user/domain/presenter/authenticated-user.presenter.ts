import { injectable } from "inversify";
import { IPresenter, Presented } from "../../../../shared/presenter";
import { AuthenticatedUser } from "../authenticated-user";
import { UserPresenter } from "./user.presenter";

type Input = AuthenticatedUser;
type Output = {
  user: Presented<UserPresenter>;
  token: {
    value: string;
  };
};

@injectable()
export class AuthenticatedUserPresenter implements IPresenter<Input, Output> {
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
