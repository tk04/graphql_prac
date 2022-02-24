import { cacheExchange, Entity, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { VoteMutationVariables } from "./../generated/graphql";
import { tUpdateQuery } from "./tUpdateQuery";
const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      })
    );
  };
import { gql } from "@urql/core";
import { isServer } from "./isServer";
// import gql from "graphql-tag";
export type MergeMode = "before" | "after";

export interface PaginationParams {
  cursorArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    // console.log(_parent, fieldArgs, cache, info);
    const { parentKey: entityKey, fieldName } = info;
    // console.log(info);
    const allFields = cache.inspectFields(entityKey);
    // console.log(allFields);
    // // console.log(allFields);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    // console.log(fieldInfos);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    // info.partial = true; // mark as partial so urql knows to fetch from server
    const inCache = cache.resolve(
      cache.resolve(
        entityKey,
        `${fieldName},(${stringifyVariables(fieldArgs)})`
      ) as Entity,
      "posts"
    );
    info.partial = !inCache;
    // console.log(inCache);
    const results: string[] = [];
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey);
      const data = cache.resolve(key as Entity, "posts") as string[];
      const _hasMore = cache.resolve(key as Entity, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }

      // console.log(data);
      results.push(...data);
    });

    return { __typename: "PaginatedPosts", posts: results, hasMore };
  };
};
//     const visited = new Set();
//     let result: NullArray<string> = [];
//     let prevOffset: number | null = null;

//     for (let i = 0; i < size; i++) {
//       const { fieldKey, arguments: args } = fieldInfos[i];
//       if (args === null || !compareArgs(fieldArgs, args)) {
//         continue;
//       }

//       const links = cache.resolve(entityKey, fieldKey) as string[];
//       const currentOffset = args[cursorArgument];

//       if (
//         links === null ||
//         links.length === 0 ||
//         typeof currentOffset !== "number"
//       ) {
//         continue;
//       }

//       const tempResult: NullArray<string> = [];

//       for (let j = 0; j < links.length; j++) {
//         const link = links[j];
//         if (visited.has(link)) continue;
//         tempResult.push(link);
//         visited.add(link);
//       }

//       if (
//         (!prevOffset || currentOffset > prevOffset) ===
//         (mergeMode === "after")
//       ) {
//         result = [...result, ...tempResult];
//       } else {
//         result = [...tempResult, ...result];
//       }

//       prevOffset = currentOffset;
//     }

//     const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
//     if (hasCurrentPage) {
//       return result;
//     } else if (!(info as any).store.schema) {
//       return undefined;
//     } else {
//       info.partial = true;
//       return result;
//     }
//   };
// };

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    __typename
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );
              // console.log("data", data);
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                console.log(newPoints);
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      __typename
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments);
              });
            },
            logout: (_result, args, cache, info) => {
              tUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                {},
                () => ({ me: null })
              );
            },
            login: (_result, args, cache, info) => {
              tUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },
            register: (_result, args, cache, info) => {
              tUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
