import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import {
    mods,
    modStats,
    userTable,
    games,
    categories,
    modTags,
    modImages,
    modFiles,
} from "../../db/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

const getModsInput = z.object({
    limit: z.number().min(1).max(100).default(10),
    offset: z.number().min(0).default(0),
    gameSlug: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    sortBy: z
        .enum(["downloads", "rating", "created", "updated", "likes"])
        .default("downloads"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const getModByIdInput = z.object({
    id: z.number().int().positive(),
});

const getModBySlugInput = z.object({
    slug: z.string().min(1),
});

const createModInput = z.object({
    title: z.string().min(1).max(255),
    description: z.string().min(1),
    longDescription: z.string().optional(),
    version: z.string().min(1).default("1.0.0"),
    imageUrl: z.string().url().optional(),
    downloadUrl: z.string().url().optional(),
    size: z.string().optional(),
    authorId: z.number().int().positive(),
    gameId: z.number().int().positive(),
    categoryId: z.number().int().positive(),
    tags: z.array(z.string()).optional(),
});

export const modRouter = router({
    getMods: publicProcedure
        .input(getModsInput)
        .query(async ({ ctx, input }) => {
            try {
                const {
                    limit,
                    offset,
                    gameSlug,
                    category,
                    search,
                    sortBy,
                    sortOrder,
                } = input;

                const conditions = [eq(mods.isActive, true)];

                if (gameSlug) {
                    conditions.push(eq(games.slug, gameSlug));
                }

                if (category) {
                    conditions.push(eq(categories.slug, category));
                }

                if (search) {
                    conditions.push(
                        sql`${mods.title} LIKE ${`%${search}%`} OR ${
                            mods.description
                        } LIKE ${`%${search}%`}`
                    );
                }

                const sortColumn = {
                    downloads: modStats.totalDownloads,
                    rating: modStats.rating,
                    created: mods.createdAt,
                    updated: mods.updatedAt,
                    likes: modStats.likes,
                }[sortBy];

                const result = await ctx.db
                    .select({
                        id: mods.id,
                        title: mods.title,
                        slug: mods.slug,
                        description: mods.description,
                        version: mods.version,
                        imageUrl: mods.imageUrl,
                        size: mods.size,
                        createdAt: mods.createdAt,
                        updatedAt: mods.updatedAt,
                        author: {
                            id: userTable.id,
                            username: userTable.username,
                            profilePicture: userTable.profilePicture,
                        },
                        game: {
                            id: games.id,
                            name: games.name,
                            slug: games.slug,
                        },
                        category: {
                            id: categories.id,
                            name: categories.name,
                            slug: categories.slug,
                            color: categories.color,
                        },
                        stats: {
                            totalDownloads: modStats.totalDownloads,
                            likes: modStats.likes,
                            rating: modStats.rating,
                            ratingCount: modStats.ratingCount,
                        },
                    })
                    .from(mods)
                    .leftJoin(userTable, eq(mods.authorId, userTable.id))
                    .leftJoin(games, eq(mods.gameId, games.id))
                    .leftJoin(categories, eq(mods.categoryId, categories.id))
                    .leftJoin(modStats, eq(mods.id, modStats.modId))
                    .where(and(...conditions))
                    .orderBy(
                        sortOrder === "desc"
                            ? desc(sortColumn)
                            : asc(sortColumn)
                    )
                    .limit(limit)
                    .offset(offset);

                const totalQuery = await ctx.db
                    .select({ count: sql<number>`count(*)` })
                    .from(mods)
                    .leftJoin(games, eq(mods.gameId, games.id))
                    .leftJoin(categories, eq(mods.categoryId, categories.id))
                    .where(and(...conditions));
                const [{ count: total }] = totalQuery;

                return {
                    mods: result,
                    pagination: {
                        total,
                        limit,
                        offset,
                        hasMore: offset + limit < total,
                    },
                };
            } catch (error) {
                console.error("Error fetching mods:", error);
                throw new Error("Failed to fetch mods");
            }
        }),

    getModById: publicProcedure
        .input(getModByIdInput)
        .query(async ({ ctx, input }) => {
            const result = await ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    slug: mods.slug,
                    description: mods.description,
                    longDescription: mods.longDescription,
                    version: mods.version,
                    imageUrl: mods.imageUrl,
                    downloadUrl: mods.downloadUrl,
                    size: mods.size,
                    createdAt: mods.createdAt,
                    updatedAt: mods.updatedAt,
                    author: {
                        id: userTable.id,
                        username: userTable.username,
                        profilePicture: userTable.profilePicture,
                        bio: userTable.bio,
                    },
                    game: {
                        id: games.id,
                        name: games.name,
                        slug: games.slug,
                        description: games.description,
                        imageUrl: games.imageUrl,
                    },
                    category: {
                        id: categories.id,
                        name: categories.name,
                        slug: categories.slug,
                        color: categories.color,
                    },
                    stats: {
                        totalDownloads: modStats.totalDownloads,
                        weeklyDownloads: modStats.weeklyDownloads,
                        monthlyDownloads: modStats.monthlyDownloads,
                        likes: modStats.likes,
                        views: modStats.views,
                        rating: modStats.rating,
                        ratingCount: modStats.ratingCount,
                    },
                })
                .from(mods)
                .leftJoin(userTable, eq(mods.authorId, userTable.id))
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(modStats, eq(mods.id, modStats.modId))
                .where(and(eq(mods.id, input.id), eq(mods.isActive, true)))
                .limit(1);

            if (!result.length) {
                throw new Error("Mod not found");
            }

            const mod = result[0];

            const tags = await ctx.db
                .select({ tag: modTags.tag })
                .from(modTags)
                .where(eq(modTags.modId, input.id));

            const images = await ctx.db
                .select()
                .from(modImages)
                .where(eq(modImages.modId, input.id))
                .orderBy(asc(modImages.order));

            const files = await ctx.db
                .select()
                .from(modFiles)
                .where(eq(modFiles.modId, input.id))
                .orderBy(desc(modFiles.isMainFile), desc(modFiles.createdAt));

            return {
                ...mod,
                tags: tags.map((t) => t.tag),
                images,
                files,
            };
        }),
    getModBySlug: publicProcedure
        .input(getModBySlugInput)
        .query(async ({ ctx, input }) => {
            const result = await ctx.db
                .select({ id: mods.id })
                .from(mods)
                .where(and(eq(mods.slug, input.slug), eq(mods.isActive, true)))
                .limit(1);

            if (!result.length) {
                throw new Error("Mod not found");
            }

            const fullModResult = await ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    slug: mods.slug,
                    description: mods.description,
                    longDescription: mods.longDescription,
                    version: mods.version,
                    imageUrl: mods.imageUrl,
                    downloadUrl: mods.downloadUrl,
                    size: mods.size,
                    createdAt: mods.createdAt,
                    updatedAt: mods.updatedAt,
                    author: {
                        id: userTable.id,
                        username: userTable.username,
                        profilePicture: userTable.profilePicture,
                        bio: userTable.bio,
                    },
                    game: {
                        id: games.id,
                        name: games.name,
                        slug: games.slug,
                        description: games.description,
                        imageUrl: games.imageUrl,
                    },
                    category: {
                        id: categories.id,
                        name: categories.name,
                        slug: categories.slug,
                        color: categories.color,
                    },
                    stats: {
                        totalDownloads: modStats.totalDownloads,
                        weeklyDownloads: modStats.weeklyDownloads,
                        monthlyDownloads: modStats.monthlyDownloads,
                        likes: modStats.likes,
                        views: modStats.views,
                        rating: modStats.rating,
                        ratingCount: modStats.ratingCount,
                    },
                })
                .from(mods)
                .leftJoin(userTable, eq(mods.authorId, userTable.id))
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(modStats, eq(mods.id, modStats.modId))
                .where(eq(mods.id, result[0].id))
                .limit(1);

            if (!fullModResult.length) {
                throw new Error("Mod not found");
            }

            const mod = fullModResult[0];

            const tags = await ctx.db
                .select({ tag: modTags.tag })
                .from(modTags)
                .where(eq(modTags.modId, result[0].id));

            const images = await ctx.db
                .select()
                .from(modImages)
                .where(eq(modImages.modId, result[0].id))
                .orderBy(asc(modImages.order));

            const files = await ctx.db
                .select()
                .from(modFiles)
                .where(eq(modFiles.modId, result[0].id))
                .orderBy(desc(modFiles.isMainFile), desc(modFiles.createdAt));

            return {
                ...mod,
                tags: tags.map((t) => t.tag),
                images,
                files,
            };
        }),

    getFeaturedMods: publicProcedure
        .input(z.object({ limit: z.number().min(1).max(20).default(4) }))
        .query(async ({ ctx, input }) => {
            return ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    slug: mods.slug,
                    description: mods.description,
                    imageUrl: mods.imageUrl,
                    author: {
                        id: userTable.id,
                        username: userTable.username,
                        profilePicture: userTable.profilePicture,
                    },
                    game: {
                        name: games.name,
                        slug: games.slug,
                    },
                    category: {
                        name: categories.name,
                        color: categories.color,
                    },
                    stats: {
                        totalDownloads: modStats.totalDownloads,
                        likes: modStats.likes,
                        rating: modStats.rating,
                    },
                })
                .from(mods)
                .leftJoin(userTable, eq(mods.authorId, userTable.id))
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(modStats, eq(mods.id, modStats.modId))
                .where(and(eq(mods.isActive, true), eq(mods.isFeatured, true)))
                .orderBy(desc(modStats.totalDownloads))
                .limit(input.limit);
        }),

    getModsByAuthor: publicProcedure
        .input(
            z.object({
                authorId: z.number().int().positive(),
                limit: z.number().min(1).max(100).default(10),
                offset: z.number().min(0).default(0),
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    slug: mods.slug,
                    description: mods.description,
                    imageUrl: mods.imageUrl,
                    createdAt: mods.createdAt,
                    game: {
                        name: games.name,
                        slug: games.slug,
                    },
                    category: {
                        name: categories.name,
                        color: categories.color,
                    },
                    stats: {
                        totalDownloads: modStats.totalDownloads,
                        likes: modStats.likes,
                        rating: modStats.rating,
                    },
                })
                .from(mods)
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(modStats, eq(mods.id, modStats.modId))
                .where(
                    and(
                        eq(mods.authorId, input.authorId),
                        eq(mods.isActive, true)
                    )
                )
                .orderBy(desc(mods.createdAt))
                .limit(input.limit)
                .offset(input.offset);
        }),

    createMod: publicProcedure
        .input(createModInput)
        .mutation(async ({ ctx, input }) => {
            const { tags, ...modData } = input;

            const slug = modData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            const [newMod] = await ctx.db
                .insert(mods)
                .values({ ...modData, slug })
                .returning();

            await ctx.db.insert(modStats).values({ modId: newMod.id });

            if (tags && tags.length > 0) {
                await ctx.db
                    .insert(modTags)
                    .values(tags.map((tag) => ({ modId: newMod.id, tag })));
            }

            return newMod;
        }),
});

export type ModRouter = typeof modRouter;
