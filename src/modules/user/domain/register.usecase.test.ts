import { mock } from "jest-mock-extended";

import { IDateProvider } from "../../core/domain/ports/date-provider.interface";
import { IIDProvider } from "../../core/domain/ports/id-provider.interface";
import {
  IAuthRepository,
  UsernameAlreadyTakenException,
} from "./ports/auth-repository.interface";
import { RegisterUseCase } from "./register.usecase";
import { User } from "./user";
import { ResultUtils } from "../../../shared/result";

describe("RegisterUseCase", () => {
  describe("Feature: I want to register a new user", () => {
    let useCase: RegisterUseCase;

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({ now: () => new Date() });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      const authRepository = mock<IAuthRepository>({
        register: async (user) =>
          new User({
            id: user.id,
            username: user.username,
            hashedPassword: user.clearPassword,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }),
      });

      useCase = new RegisterUseCase(dateProvider, idProvider, authRepository);
    });

    it("should create a new user with the given data", async () => {
      const result = await useCase.execute({
        username: "johndoe",
        password: "123456",
      });

      expect(result.ok).toBe(true);

      const { user } = ResultUtils.unwrap(result);
      expect(user.username).toBe("johndoe");
      expect(user.hashedPassword).toBe("123456");
    });
  });

  describe("Feature: the username is already taken", () => {
    let useCase: RegisterUseCase;

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({ now: () => new Date() });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      const authRepository = mock<IAuthRepository>({
        register: async (user) => {
          throw new UsernameAlreadyTakenException();
        },
      });

      useCase = new RegisterUseCase(dateProvider, idProvider, authRepository);
    });

    it("should create a new user with the given data", async () => {
      const result = await useCase.execute({
        username: "johndoe",
        password: "123456",
      });

      expect(result.ok).toBe(false);
      const error = ResultUtils.getError(result);
      expect(error.message).toBe("Username already taken");
    });
  });

  describe("Feature: validations", () => {
    let useCase: RegisterUseCase;

    beforeEach(() => {
      const dateProvider = mock<IDateProvider>({ now: () => new Date() });
      const idProvider = mock<IIDProvider>({ generate: () => "1" });
      const authRepository = mock<IAuthRepository>();
      useCase = new RegisterUseCase(dateProvider, idProvider, authRepository);
    });

    describe("Validation: Username", () => {
      it("should reject an empty short username", async () => {
        const result = await useCase.execute({
          username: "",
          password: "123456",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe("Username cannot be empty");
      });
      it("should reject a short username", async () => {
        const result = await useCase.execute({
          username: "j",
          password: "123456",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe(
          "Username must be at least 2 characters long"
        );
      });

      it("should reject a long username", async () => {
        const result = await useCase.execute({
          username: "thisisanincrediblylongusernamethat",
          password: "123456",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe(
          "Username cannot be longer than 32 characters"
        );
      });
    });

    describe("Validation: password", () => {
      it("should reject an empty password", async () => {
        const result = await useCase.execute({
          username: "johndoe",
          password: "",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe("Password cannot be empty");
      });
      it("should reject a short password", async () => {
        const result = await useCase.execute({
          username: "johndoe",
          password: "12345",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe(
          "Password must be at least 6 characters long"
        );
      });

      it("should reject a long password", async () => {
        const result = await useCase.execute({
          username: "johndoe",
          password: "thisisanincrediblylongusernamethat",
        });

        expect(result.ok).toBe(false);

        const error = ResultUtils.getError(result);
        expect(error.message).toBe(
          "Password cannot be longer than 32 characters"
        );
      });
    });
  });
});
