import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  TypedLazyQueryTrigger,
  TypedMutationTrigger,
} from "@reduxjs/toolkit/query/react";

export type LazyGetTriggerType<T, U> = TypedLazyQueryTrigger<
  U, // Response type
  T, // Request parameters type
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
>;

export type MutationTriggerType<TRequest, TResponse> = TypedMutationTrigger<
  TResponse,
  TRequest,
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
>;
