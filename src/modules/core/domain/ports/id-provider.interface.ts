export const I_ID_PROVIDER = Symbol("IIDProvider");

export interface IIDProvider {
  generate(): string;
}
