import { router } from '../trpc';
import { modRouter } from './mod';

export const appRouter = router({
  mod: modRouter,
});

export type AppRouter = typeof appRouter;
