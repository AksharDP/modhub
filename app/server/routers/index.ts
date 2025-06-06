import { router } from "../trpc";
import { modRouter } from "./mod";
import { adminRouter } from "./admin";

export const appRouter = router({
    mod: modRouter,
    admin: adminRouter,
});

export type AppRouter = typeof appRouter;
