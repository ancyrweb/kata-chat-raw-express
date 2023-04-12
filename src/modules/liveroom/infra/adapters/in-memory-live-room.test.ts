import { FakeDateProvider } from "../../../core/infra/adapters/fake.date-provider";
import { Status } from "../../domain/ports/live-room.repository-interface";
import { InMemoryLiveRoom } from "./in-memory-live-room";

describe("LiveRoom", () => {
  let dateProvider: FakeDateProvider;
  let liveRoom: InMemoryLiveRoom;

  beforeEach(() => {
    dateProvider = new FakeDateProvider();
    liveRoom = new InMemoryLiveRoom(dateProvider);
  });

  it("when the user joins a live room, it should be online", () => {
    liveRoom.join("user1");
    expect(liveRoom.getUsers()).toEqual([
      {
        userId: "user1",
        status: Status.ONLINE,
      },
    ]);
  });

  it("when the user leaves a live room, it should be removed", () => {
    liveRoom.join("user1");
    liveRoom.leave("user1");

    expect(liveRoom.getUsers()).toEqual([]);
  });

  it("when the user does act for 5 minutes, it should appear idle", () => {
    liveRoom.join("user1");
    dateProvider.addMinutes(5);

    expect(liveRoom.getUsers()).toEqual([
      {
        userId: "user1",
        status: Status.IDLE,
      },
    ]);
  });

  it("when the user does act for 10 minutes, it should appear offline", () => {
    liveRoom.join("user1");
    dateProvider.addMinutes(10);

    expect(liveRoom.getUsers()).toEqual([
      {
        userId: "user1",
        status: Status.OFFLINE,
      },
    ]);
  });
  it("when the user refreshes its last action, it should pop back to online", () => {
    liveRoom.join("user1");
    dateProvider.addMinutes(10);
    liveRoom.refresh("user1");

    expect(liveRoom.getUsers()).toEqual([
      {
        userId: "user1",
        status: Status.ONLINE,
      },
    ]);
  });
});
