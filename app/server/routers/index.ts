import { router } from "../trpc";
import { modRouter } from "./mod";
import { adminRouter } from "./admin";
import { gameRouter } from "./game"; // Add this import

export const appRouter = router({
    mod: modRouter,
    admin: adminRouter,
    game: gameRouter, // Add the game router
});

export type AppRouter = typeof appRouter;
