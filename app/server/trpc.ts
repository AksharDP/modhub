import { initTRPC } from "@trpc/server";
import { db } from "../db";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Create context for tRPC (can include user session, database, etc.)
 */
export function createTRPCContext() {
    return {
        db,
    };
}

export type Context = ReturnType<typeof createTRPCContext>;
