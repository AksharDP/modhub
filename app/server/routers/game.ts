import { router, publicProcedure } from "../trpc";
import { games, mods } from "../../db/schema";
import { eq, sql, asc } from "drizzle-orm";

export const gameRouter = router({
    getPublicGames: publicProcedure.query(async ({ ctx }) => {
        const result = await ctx.db
            .select({
                id: games.id,
                name: games.name,
                slug: games.slug,
                description: games.description,
                imageUrl: games.imageUrl,
                modCount: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${mods}
                    WHERE ${mods.gameId} = ${games.id} AND ${mods.isActive} = true
                )`.as('mod_count'),
            })
            .from(games)
            .where(eq(games.isActive, true))
            .orderBy(asc(games.name));

        return result;
    }),
});

export type GameRouter = typeof gameRouter;
