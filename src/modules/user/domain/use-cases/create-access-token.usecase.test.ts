import { mock } from "jest-mock-extended";
import {
  AccessTokenCreated,
  CreateAccessTokenUseCase,
} from "./create-access-token.usecase";
import { IAuthRepository } from "../ports/auth-repository.interface";
import { APIToken, TokenExpiredException } from "../entity/api-token";
import { AccessToken } from "../entity/access-token";
import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { ResultUtils } from "../../../../shared/result";
import { IEventDispatcher } from "../../../core/domain/ports/event-dispatcher.interface";
import { NotFoundException } from "../../../../shared/errors";
import { User, UserTestFactory } from "../entity/user";

describe("Feature: creating an access token", () => {
  describe("Case: I have a valid API token", () => {
    let useCase: CreateAccessTokenUseCase;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const authRepository = mock<IAuthRepository>({
      findAPITokenByValue: jest.fn().mockResolvedValue(
        new APIToken({
          id: "1",
          user: UserTestFactory.create({
            id: "1",
            username: "johndoe",
          }),
          value: "123",
          createdAt: new Date("2023-01-01"),
          expiresAt: new Date("2023-03-01"),
          expired: false,
        })
      ),
      createAccessToken: jest.fn().mockResolvedValue(
        new AccessToken({
          expiresAt: new Date("2023-01-01T01:00:00.000"),
          value: "123",
        })
      ),
    });

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateAccessTokenUseCase(
        dateProvider,
        eventDispatcher,
        authRepository
      );
    });

    it("should return a valid access token", async () => {
      const result = await useCase.execute({
        apiTokenValue: "123",
      });

      expect(result.ok).toBeTruthy();
      const data = ResultUtils.unwrap(result);

      expect(data.expiresAt).toEqual(new Date("2023-01-01T01:00:00.000"));
      expect(data.value).toEqual("123");
    });

    it("should dispatch an event", async () => {
      await useCase.execute({
        apiTokenValue: "123",
      });

      expect(eventDispatcher.raise).toBeCalledTimes(1);
      const event = eventDispatcher.raise.mock.calls[0][0];
      expect(event).toBeInstanceOf(AccessTokenCreated);
      expect(event.props).toEqual({
        userId: "1",
      });
    });
  });

  describe("Case: I have an invalid API token", () => {
    let useCase: CreateAccessTokenUseCase;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const authRepository = mock<IAuthRepository>({
      findAPITokenByValue: jest.fn().mockResolvedValue(null),
    });

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-01T00:00:00.000"),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateAccessTokenUseCase(
        dateProvider,
        eventDispatcher,
        authRepository
      );
    });

    it("should return a not found error", async () => {
      const result = await useCase.execute({
        apiTokenValue: "123",
      });

      expect(result.ok).toBeFalsy();
      const error = ResultUtils.getError(result);

      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual("Invalid API token");
    });

    it("should not dispatch an event", async () => {
      await useCase.execute({
        apiTokenValue: "123",
      });

      expect(eventDispatcher.raise).toBeCalledTimes(0);
    });
  });

  describe("Case: the API token is expired", () => {
    let useCase: CreateAccessTokenUseCase;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const authRepository = mock<IAuthRepository>({
      findAPITokenByValue: jest.fn().mockResolvedValue(
        new APIToken({
          id: "1",
          user: UserTestFactory.create({
            id: "1",
            username: "johndoe",
          }),
          value: "123",
          createdAt: new Date("2023-01-01T00:00:00.000"),
          expiresAt: new Date("2023-01-03T00:00:00.000"),
          expired: false,
        })
      ),
    });

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-05T00:00:00.000"),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateAccessTokenUseCase(
        dateProvider,
        eventDispatcher,
        authRepository
      );
    });

    it("should return a not found error", async () => {
      const result = await useCase.execute({
        apiTokenValue: "123",
      });

      expect(result.ok).toBeFalsy();
      const error = ResultUtils.getError(result);

      expect(error).toBeInstanceOf(TokenExpiredException);
      expect(error.message).toEqual("Token is expired");
    });

    it("should not dispatch an event", async () => {
      await useCase.execute({
        apiTokenValue: "123",
      });

      expect(eventDispatcher.raise).toBeCalledTimes(0);
    });
  });

  describe("Case: the API token is expired manually", () => {
    let useCase: CreateAccessTokenUseCase;
    let eventDispatcher: ReturnType<typeof mock<IEventDispatcher>>;

    const authRepository = mock<IAuthRepository>({
      findAPITokenByValue: jest.fn().mockResolvedValue(
        new APIToken({
          id: "1",
          user: UserTestFactory.create({
            id: "1",
            username: "johndoe",
          }),
          value: "123",
          createdAt: new Date("2023-01-01T00:00:00.000"),
          expiresAt: new Date("2023-01-07T00:00:00.000"),
          expired: true,
        })
      ),
    });

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2023-01-05T00:00:00.000"),
      });

      eventDispatcher = mock<IEventDispatcher>();

      useCase = new CreateAccessTokenUseCase(
        dateProvider,
        eventDispatcher,
        authRepository
      );
    });

    it("should return a not found error", async () => {
      const result = await useCase.execute({
        apiTokenValue: "123",
      });

      expect(result.ok).toBeFalsy();
      const error = ResultUtils.getError(result);

      expect(error).toBeInstanceOf(TokenExpiredException);
      expect(error.message).toEqual("Token is expired");
    });

    it("should not dispatch an event", async () => {
      await useCase.execute({
        apiTokenValue: "123",
      });

      expect(eventDispatcher.raise).toBeCalledTimes(0);
    });
  });
});
