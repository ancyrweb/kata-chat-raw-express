type Data = {
  value: string;
  expiresAt: Date;
};

export class AccessToken {
  constructor(private readonly data: Data) {}

  get value() {
    return this.data.value;
  }

  get expiresAt() {
    return this.data.expiresAt;
  }
}
