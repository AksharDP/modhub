import { router, publicProcedure } from "../trpc";
import { games, mods } from "../../db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { z } from "zod";

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

    getGameBySlug: publicProcedure
        .input(z.object({
            slug: z.string().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const game = await ctx.db
                .select({
                    id: games.id,
                    name: games.name,
                    slug: games.slug,
                    description: games.description,
                    imageUrl: games.imageUrl,
                    formSchema: games.formSchema,
                    visibleToUsers: games.visibleToUsers,
                    visibleToSupporters: games.visibleToSupporters,
                })
                .from(games)
                .where(eq(games.slug, input.slug))
                .limit(1);

            return game[0] || null;
        }),
});

export type GameRouter = typeof gameRouter;
