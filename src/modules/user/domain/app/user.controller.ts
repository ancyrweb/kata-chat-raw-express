import { controller, httpPost, request } from "inversify-express-utils";
import { RegisterUseCase } from "../register.usecase";
import { Request } from "express";

@controller("/")
export class UserController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @httpPost("/auth/register")
  async register(@request() req: Request) {
    const result = await this.registerUseCase.execute({
      username: req.body.username,
      password: req.body.password,
    });
  }
}
