import {
  controller,
  httpPost,
  request,
  interfaces,
  injectHttpContext,
  requestParam,
  httpPut,
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
import { RenameRoomUseCase } from "../domain/rename-room.usecase";
import { MessagePresenter } from "../domain/presenters/message.presenter";
import { SendMessageUseCase } from "../domain/send-message.usecase";

@controller("/rooms")
export class RoomsController extends BaseController {
  constructor(
    @injectHttpContext httpContext: interfaces.HttpContext,
    @inject(CreateRoomUseCase)
    private readonly createRoomUseCase: CreateRoomUseCase,
    @inject(RenameRoomUseCase)
    private readonly renameRoomUseCase: RenameRoomUseCase,
    @inject(SendMessageUseCase)
    private readonly sendMessageUseCase: SendMessageUseCase,

    @inject(RoomPresenter) private readonly roomPresenter: RoomPresenter,
    @inject(MessagePresenter)
    private readonly messagePresenter: MessagePresenter
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

  @mustBeAuthenticated()
  @statusCode(200)
  @httpPut("/:id/name")
  async renameRoom(
    @request() req: Request,
    @requestParam("id") id: string
  ): Promise<Presented<RoomPresenter>> {
    const result = await this.renameRoomUseCase.execute({
      roomId: id,
      name: req.body.name,
      requester: this.getUser(),
    });

    const room = ResultUtils.unwrap(result);
    return this.roomPresenter.transform(room);
  }

  @mustBeAuthenticated()
  @statusCode(201)
  @httpPost("/:id/messages")
  async sendMessage(
    @request() req: Request,
    @requestParam("id") id: string
  ): Promise<Presented<MessagePresenter>> {
    const result = await this.sendMessageUseCase.execute({
      roomId: id,
      requester: this.getUser(),
      content: req.body.content,
    });

    const message = ResultUtils.unwrap(result);
    return this.messagePresenter.transform(message);
  }
}
