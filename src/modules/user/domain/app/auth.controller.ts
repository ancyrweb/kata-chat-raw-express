import {
  controller,
  httpPost,
  request,
  interfaces,
} from "inversify-express-utils";
import { RegisterUseCase } from "../register.usecase";
import { Request } from "express";
import { Presented } from "../../../../shared/presenter";
import { UserPresenter } from "../presenter/user.presenter";
import { ResultUtils } from "../../../../shared/result";
import { LoginUseCase } from "../login.usecase";
import { AuthenticatedUserPresenter } from "../presenter/authenticated-user.presenter";

@controller("/auth")
export class AuthController implements interfaces.Controller {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,

    private readonly userPresenter: UserPresenter,
    private readonly authenticatedUserPresenter: AuthenticatedUserPresenter
  ) {}

  @httpPost("/register")
  async register(@request() req: Request): Promise<Presented<UserPresenter>> {
    const result = await this.registerUseCase.execute({
      username: req.body.username,
      password: req.body.password,
    });

    const { user } = ResultUtils.unwrap(result);
    return this.userPresenter.transform(user);
  }

  @httpPost("/login")
  async login(
    @request() req: Request
  ): Promise<Presented<AuthenticatedUserPresenter>> {
    const result = await this.loginUseCase.execute({
      username: req.body.username,
      password: req.body.password,
    });

    const authenticatedUser = ResultUtils.unwrap(result);
    return this.authenticatedUserPresenter.transform(authenticatedUser);
  }
}
