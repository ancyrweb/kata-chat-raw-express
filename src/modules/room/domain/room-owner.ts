import { AbstractEntity } from "../../../shared/entity";
import { DomainException } from "../../../shared/errors";

type RoomOwnerData = {
  id: string;
  roomsCreatedAmount: number;
};

export class RoomOwner extends AbstractEntity<RoomOwnerData> {
  static MAX_AMOUNT_OF_ROOMS = 3;

  get id() {
    return this.state.id;
  }

  get roomsCreatedAmount() {
    return this.state.roomsCreatedAmount;
  }

  tryToReserveRoom() {
    if (this.roomsCreatedAmount >= RoomOwner.MAX_AMOUNT_OF_ROOMS) {
      throw new ExceededMaxAmountOfRoomsError();
    }

    this.setState({
      roomsCreatedAmount: this.roomsCreatedAmount + 1,
    });
  }
}

export class ExceededMaxAmountOfRoomsError extends DomainException {
  constructor() {
    super(
      "Exceeded max amount of rooms",
      "ROOM_OWNER_EXCEEDED_MAX_AMOUNT_OF_ROOMS"
    );
  }
}
