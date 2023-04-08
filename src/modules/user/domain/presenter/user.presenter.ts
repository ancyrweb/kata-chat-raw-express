import { injectable } from "inversify";
import { IPresenter } from "../../../../shared/presenter";
import { User } from "../user";

type Input = User;
type Output = {
  id: string;
  username: string;
};

@injectable()
export class UserPresenter implements IPresenter<Input, Output> {
  async transform(input: Input): Promise<Output> {
    return {
      id: input.id,
      username: input.username,
    };
  }
}
