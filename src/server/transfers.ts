import { createServerFn } from "@tanstack/react-start";
import { api } from "convex/_generated/api";
import { z } from "zod";

import { getConvexClient } from "~/server/convex-client";

import type { Doc } from "convex/_generated/dataModel";

const getTransfersSnapshotServer = createServerFn({ method: "GET" })
  .validator(z.object({}))
  .handler(async (): Promise<Doc<"transfers">[] | null> => {
    const convex = getConvexClient("warn");
    if (!convex) return null;

    try {
      return await convex.query(api.transfers.getAllTransfers, {});
    } catch (err) {
      console.warn("getTransfersSnapshot failed", err);
      return null;
    }
  });

export function getTransfersSnapshot(): Promise<Doc<"transfers">[] | null> {
  return getTransfersSnapshotServer({ data: {} });
}
