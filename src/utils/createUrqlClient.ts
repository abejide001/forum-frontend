import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import React from "react";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange, Cache, QueryInput } from "@urql/exchange-graphcache";
import theme from "../theme";
import {
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { ssrExchange } from "urql";
import betterUpdateQuery from "./betterUpdateQuery";

import { stringifyVariables } from "@urql/core";
import { Resolver, Variables, NullArray } from "../types";

export type MergeMode = "before" | "after";

export interface PaginationParams {
  cursorArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = ({
  cursorArgument = "cursor",
}: PaginationParams = {}): Resolver => {
  const compareArgs = (
    fieldArgs: Variables,
    connectionArgs: Variables
  ): boolean => {
    for (const key in connectionArgs) {
      if (key === cursorArgument) {
        continue;
      } else if (!(key in fieldArgs)) {
        return false;
      }

      const argA = fieldArgs[key];
      const argB = connectionArgs[key];

      if (
        typeof argA !== typeof argB || typeof argA !== "object"
          ? argA !== argB
          : stringifyVariables(argA) !== stringifyVariables(argB)
      ) {
        return false;
      }
    }

    for (const key in fieldArgs) {
      if (key === cursorArgument) {
        continue;
      }
      if (!(key in connectionArgs)) return false;
    }

    return true;
  };

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const visited = new Set();
    let result: NullArray<string> = [];
    let prevOffset: number | null = null;

    for (let i = 0; i < size; i++) {
      const { fieldKey, arguments: args } = fieldInfos[i];
      if (args === null || !compareArgs(fieldArgs, args)) {
        continue;
      }

      const links = cache.resolve(entityKey, fieldKey) as string[];
      const currentOffset = args[cursorArgument];

      if (
        links === null ||
        links.length === 0 ||
        typeof currentOffset !== "number"
      ) {
        continue;
      }

      const tempResult: NullArray<string> = [];

      for (let j = 0; j < links.length; j++) {
        const link = links[j];
        if (visited.has(link)) continue;
        tempResult.push(link);
        visited.add(link);
      }

      if (
        (!prevOffset || currentOffset > prevOffset) ===
        (mergeMode === "after")
      ) {
        result = [...result, ...tempResult];
      } else {
        result = [...tempResult, ...result];
      }

      prevOffset = currentOffset;
    }

    const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    if (hasCurrentPage) {
      return result;
    } else if (!(info as any).store.schema) {
      return undefined;
    } else {
      info.partial = true;
      return result;
    }
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info): void => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
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
          register: (result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
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
    ssrExchange,
    fetchExchange,
  ],
});
