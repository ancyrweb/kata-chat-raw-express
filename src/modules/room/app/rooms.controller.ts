import {
  controller,
  httpPost,
  request,
  response,
  interfaces,
  injectHttpContext,
} from "inversify-express-utils";
import { Request, Response } from "express";

import { mustBeAuthenticated } from "../../user/infra/must-be-authenticated.decorator";
import { BaseController } from "../../../framework/base-controller";
import { statusCode } from "../../core/infra/status-code.decorator";

@controller("/rooms")
export class RoomsController extends BaseController {
  constructor(@injectHttpContext httpContext: interfaces.HttpContext) {
    super(httpContext);
  }

  @mustBeAuthenticated()
  @statusCode(204)
  @httpPost("/")
  async createRoom(
    @request() req: Request,
    @response() res: Response
  ): Promise<any> {
    return {
      isOk: true,
    };
  }
}
