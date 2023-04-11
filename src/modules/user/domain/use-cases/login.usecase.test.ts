import { mock } from "jest-mock-extended";

import { IDateProvider } from "../../../core/domain/ports/date-provider.interface";
import { IIDProvider } from "../../../core/domain/ports/id-provider.interface";
import {
  IAuthRepository,
  InvalidCredentialsException,
} from "../ports/auth-repository.interface";
import { UserTestFactory } from "../entity/user";
import { ResultUtils } from "../../../../shared/result";
import { LoginUseCase } from "./login.usecase";
import { IRandomProvider } from "../../../core/domain/ports/random-provider.interface";
describe("Feature: I want to login", () => {
  describe("Case: it should login when provided the correct credentials", () => {
    let useCase: LoginUseCase;
    const user = UserTestFactory.create({
      id: "user1",
      username: "johndoe",
      hashedPassword: "azerty",
    });

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2021-01-01T00:00:00.000"),
      });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      const randomProvider = mock<IRandomProvider>({
        generate: () => "random",
      });

      const authRepository = mock<IAuthRepository>({
        login: async () => user,
      });

      useCase = new LoginUseCase(
        dateProvider,
        idProvider,
        randomProvider,
        authRepository
      );
    });

    it("should login when the credentials are correct", async () => {
      const result = await useCase.execute({
        username: "johndoe",
        password: "azerty",
      });

      expect(result.ok).toBe(true);

      const authenticatedUser = ResultUtils.unwrap(result);
      expect(authenticatedUser.user).toEqual(user);
      expect(authenticatedUser.token.getState()).toMatchObject({
        id: "1",
        value: "random",
        createdAt: new Date("2021-01-01T00:00:00.000"),
        expiresAt: new Date("2021-04-01T00:00:00.000"),
        expired: false,
      });
    });
  });

  describe("Case: it should fail when provided the wrong credentials", () => {
    let useCase: LoginUseCase;

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({
        now: () => new Date("2021-01-01T00:00:00.000"),
      });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      const randomProvider = mock<IRandomProvider>({
        generate: () => "random",
      });

      const authRepository = mock<IAuthRepository>({
        login: async () => {
          throw new InvalidCredentialsException();
        },
      });

      useCase = new LoginUseCase(
        dateProvider,
        idProvider,
        randomProvider,
        authRepository
      );
    });

    it("should login when the credentials are correct", async () => {
      const result = await useCase.execute({
        username: "johndoe",
        password: "azerty",
      });

      expect(result.ok).toBe(false);

      const error = ResultUtils.getError(result);
      expect(error).toBeInstanceOf(InvalidCredentialsException);
    });
  });
});
