import {
  controller,
  httpPost,
  request,
  interfaces,
  injectHttpContext,
} from "inversify-express-utils";
import { Request } from "express";
import { inject } from "inversify";

import { mustBeAuthenticated } from "../../user/infra/must-be-authenticated.decorator";
import { BaseController } from "../../../framework/base-controller";
import { statusCode } from "../../core/infra/status-code.decorator";
import { CreateRoomUseCase } from "../domain/create-room.usecase";
import { RoomPresenter } from "../domain/presenters/room.presenter";
import { ResultUtils } from "../../../shared/result";
import { Presented } from "../../../shared/presenter";

@controller("/rooms")
export class RoomsController extends BaseController {
  constructor(
    @injectHttpContext httpContext: interfaces.HttpContext,
    @inject(CreateRoomUseCase)
    private readonly createRoomUseCase: CreateRoomUseCase,
    @inject(RoomPresenter) private readonly roomPresenter: RoomPresenter
  ) {
    super(httpContext);
  }

  @mustBeAuthenticated()
  @statusCode(201)
  @httpPost("/")
  async createRoom(@request() req: Request): Promise<Presented<RoomPresenter>> {
    const result = await this.createRoomUseCase.execute({
      name: req.body.name,
      requester: this.getUser(),
    });

    const room = ResultUtils.unwrap(result);
    return this.roomPresenter.transform(room);
  }
}
