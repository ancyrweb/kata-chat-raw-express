export interface IPresenter<TInput, TOutput> {
  transform(input: TInput): Promise<TOutput>;
}

export type Presented<T> = T extends IPresenter<any, infer P> ? P : never;
