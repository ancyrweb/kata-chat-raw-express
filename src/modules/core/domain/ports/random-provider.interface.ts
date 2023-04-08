export const I_RANDOM_PROVIDER = Symbol("IRandomProvider");

export interface IRandomProvider {
  generate(): string;
}
