import {
  controller,
  httpPost,
  request,
  interfaces,
} from "inversify-express-utils";
import { Request } from "express";

import { RegisterUseCase } from "../register.usecase";
import { Presented } from "../../../../shared/presenter";
import { UserPresenter } from "../presenter/user.presenter";
import { ResultUtils } from "../../../../shared/result";
import { LoginUseCase } from "../login.usecase";
import { UserWithAPITokenPresenter } from "../presenter/user-with-api-token.presenter";
import { AccessTokenPresenter } from "../presenter/access-token.presenter";
import { CreateAccessTokenUseCase } from "../create-access-token.usecase";

@controller("/auth")
export class AuthController implements interfaces.Controller {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly createAccessTokenUseCase: CreateAccessTokenUseCase,

    private readonly userPresenter: UserPresenter,
    private readonly authenticatedUserPresenter: UserWithAPITokenPresenter,
    private readonly accessTokenPresenter: AccessTokenPresenter
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
  ): Promise<Presented<UserWithAPITokenPresenter>> {
    const result = await this.loginUseCase.execute({
      username: req.body.username,
      password: req.body.password,
    });

    const authenticatedUser = ResultUtils.unwrap(result);
    return this.authenticatedUserPresenter.transform(authenticatedUser);
  }

  @httpPost("/create-access-token")
  async createAccessToken(
    @request() req: Request
  ): Promise<Presented<AccessTokenPresenter>> {
    const result = await this.createAccessTokenUseCase.execute({
      apiTokenValue: req.body.apiTokenValue,
    });

    const authenticatedUser = ResultUtils.unwrap(result);
    return this.accessTokenPresenter.transform(authenticatedUser);
  }
}
