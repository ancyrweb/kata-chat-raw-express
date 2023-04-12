import { FakeDateProvider } from "../../../core/infra/adapters/fake.date-provider";
import { Status } from "../../domain/ports/live-room.repository-interface";
import { InMemoryLiveRoomRepository } from "./in-memory.live-room-repository";

describe("Feature: Live Room Manager", () => {
  let manager: InMemoryLiveRoomRepository;
  let dateProvider: FakeDateProvider;

  beforeEach(() => {
    dateProvider = new FakeDateProvider();
    manager = new InMemoryLiveRoomRepository(dateProvider);
  });

  it("when the user joins a live room, it should handle it", async () => {
    await manager.join("user1", "room1");

    const users = await manager.getUsers("room1");
    expect(users).toEqual([
      {
        userId: "user1",
        status: Status.ONLINE,
      },
    ]);
  });

  it("when the user leaves a live room, it should be removed", async () => {
    await manager.join("user1", "room1");
    await manager.leave("user1", "room1");

    const users = await manager.getUsers("room1");
    expect(users).toEqual([]);
  });

  it("when the user leaves all the room, it should be removed", async () => {
    await manager.join("user1", "room1");
    await manager.join("user1", "room2");
    await manager.join("user2", "room1");
    await manager.leaveAll("user1");

    const usersOfRoom1 = await manager.getUsers("room1");
    const usersOfRoom2 = await manager.getUsers("room2");

    expect(usersOfRoom1).toEqual([
      {
        userId: "user2",
        status: Status.ONLINE,
      },
    ]);
    expect(usersOfRoom2).toEqual([]);
  });

  it("when the user is refreshed somewhere, it should refresh it everywhere", async () => {
    await manager.join("user1", "room1");
    await manager.join("user1", "room2");

    dateProvider.addMinutes(10);

    await manager.refresh("user1");

    const usersOfRoom1 = await manager.getUsers("room1");
    const usersOfRoom2 = await manager.getUsers("room2");

    expect(usersOfRoom1).toEqual([
      {
        userId: "user1",
        status: Status.ONLINE,
      },
    ]);

    expect(usersOfRoom2).toEqual([
      {
        userId: "user1",
        status: Status.ONLINE,
      },
    ]);
  });
});
