/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as cache from "../cache.js";
import type * as crons from "../crons.js";
import type * as football from "../football.js";
import type * as podcasts from "../podcasts.js";
import type * as rss from "../rss.js";
import type * as subscriptions from "../subscriptions.js";
import type * as transfers from "../transfers.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  cache: typeof cache;
  crons: typeof crons;
  football: typeof football;
  podcasts: typeof podcasts;
  rss: typeof rss;
  subscriptions: typeof subscriptions;
  transfers: typeof transfers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;

export declare const components: {};
