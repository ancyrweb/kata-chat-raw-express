export const I_DATE_PROVIDER = Symbol("IDateProvider");

export interface IDateProvider {
  now(): Date;
}
