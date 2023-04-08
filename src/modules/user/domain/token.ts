import { AbstractEntity } from "../../../shared/entity";

type TokenData = {
  id: string;
  userId: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
};

export class Token extends AbstractEntity<TokenData> {}
