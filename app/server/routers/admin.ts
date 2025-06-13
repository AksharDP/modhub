import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { userTable, mods, games, categories, modStats } from "../../db/schema";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getCurrentSession } from "../../lib/auth";

async function requireAdmin() {
    const { user } = await getCurrentSession();
    if (!user || user.role !== "admin") {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Admin access required",
        });
    }
    return user;
}

const getUsersInput = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    role: z.enum(["admin", "user", "supporter"]).optional(),
    search: z.string().optional(),
});

const updateUserRoleInput = z.object({
    userId: z.number().int().positive(),
    role: z.enum(["admin", "user", "supporter"]),
});

const deleteUserInput = z.object({
    userId: z.number().int().positive(),
});

const updateModStatusInput = z.object({
    modId: z.number().int().positive(),
    isActive: z.boolean(),
    isFeatured: z.boolean().optional(),
});

const updateModInput = z.object({
    modId: z.number().int().positive(),
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    version: z.string().min(1, "Version is required").optional(),
    imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
    downloadUrl: z.string().url("Must be a valid URL").optional().nullable(),
    size: z.string().optional(),
    gameId: z.number().int().positive().optional(),
    categoryId: z.number().int().positive().optional(),
});

const formFieldSchema = z.object({
    id: z.string(),
    type: z.enum([
        "text",
        "textarea",
        "select",
        "checkbox",
        "file",
        "static-text",
    ]),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    content: z.string().optional(),
    color: z.string().optional(),
    order: z.number(),
});

const createGameInput = z.object({
    name: z.string().min(1, "Game name is required"),
    slug: z.string().min(1, "Game slug is required"),
    description: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").optional(),
    visibleToUsers: z.boolean().default(true),
    visibleToSupporters: z.boolean().default(true),
    formSchema: z.array(formFieldSchema).default([]),
});

const updateGameInput = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1, "Game name is required").optional(),
    slug: z.string().min(1, "Game slug is required").optional(),
    description: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").optional(),
    isActive: z.boolean().optional(),
    visibleToUsers: z.boolean().optional(),
    visibleToSupporters: z.boolean().optional(),
    formSchema: z.array(formFieldSchema).optional(),
});

const deleteGameInput = z.object({
    gameId: z.number().int().positive(),
    deleteMods: z.boolean().default(true),
});

export const adminRouter = router({
    getDashboardStats: publicProcedure.query(async ({ ctx }) => {
        await requireAdmin();

        const [usersCount] = await ctx.db
            .select({ count: count() })
            .from(userTable);

        const [modsCount] = await ctx.db.select({ count: count() }).from(mods);

        const [activeModsCount] = await ctx.db
            .select({ count: count() })
            .from(mods)
            .where(eq(mods.isActive, true));

        const [featuredModsCount] = await ctx.db
            .select({ count: count() })
            .from(mods)
            .where(and(eq(mods.isFeatured, true), eq(mods.isActive, true)));

        const [gamesCount] = await ctx.db
            .select({ count: count() })
            .from(games);

        const [categoriesCount] = await ctx.db
            .select({ count: count() })
            .from(categories);

        const [totalDownloadsResult] = await ctx.db
            .select({
                totalDownloads: sql<number>`COALESCE(SUM(${modStats.totalDownloads}), 0)`,
            })
            .from(modStats);

        return {
            users: usersCount.count,
            mods: modsCount.count,
            activeMods: activeModsCount.count,
            featuredMods: featuredModsCount.count,
            games: gamesCount.count,
            categories: categoriesCount.count,
            totalDownloads: totalDownloadsResult.totalDownloads,
        };
    }),

    getUsers: publicProcedure
        .input(getUsersInput)
        .query(async ({ ctx, input }) => {
            await requireAdmin();
            const { limit, offset, role, search } = input;

            const conditions = [];

            if (role) {
                conditions.push(eq(userTable.role, role));
            }

            if (search) {
                conditions.push(
                    sql`(${userTable.username} ILIKE ${`%${search}%`} OR ${
                        userTable.email
                    } ILIKE ${`%${search}%`})`
                );
            }

            const users = await ctx.db
                .select({
                    id: userTable.id,
                    username: userTable.username,
                    email: userTable.email,
                    role: userTable.role,
                    profilePicture: userTable.profilePicture,
                    bio: userTable.bio,
                    createdAt: userTable.createdAt,
                    updatedAt: userTable.updatedAt,
                })
                .from(userTable)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(userTable.createdAt))
                .limit(limit)
                .offset(offset);

            const [{ count: total }] = await ctx.db
                .select({ count: count() })
                .from(userTable)
                .where(conditions.length > 0 ? and(...conditions) : undefined);

            return {
                users,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
            };
        }),

    updateUserRole: publicProcedure
        .input(updateUserRoleInput)
        .mutation(async ({ ctx, input }) => {
            const currentUser = await requireAdmin();

            if (input.userId === currentUser.id && input.role !== "admin") {
                const [{ count: adminCount }] = await ctx.db
                    .select({ count: count() })
                    .from(userTable)
                    .where(eq(userTable.role, "admin"));

                if (adminCount <= 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Cannot remove the last admin",
                    });
                }
            }

            const [updatedUser] = await ctx.db
                .update(userTable)
                .set({
                    role: input.role,
                    updatedAt: new Date(),
                })
                .where(eq(userTable.id, input.userId))
                .returning({
                    id: userTable.id,
                    username: userTable.username,
                    role: userTable.role,
                });

            if (!updatedUser) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            return updatedUser;
        }),

    deleteUser: publicProcedure
        .input(deleteUserInput)
        .mutation(async ({ ctx, input }) => {
            const currentUser = await requireAdmin();

            if (input.userId === currentUser.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot delete your own account",
                });
            }

            const [userToDelete] = await ctx.db
                .select({ role: userTable.role })
                .from(userTable)
                .where(eq(userTable.id, input.userId));

            if (!userToDelete) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            if (userToDelete.role === "admin") {
                const [{ count: adminCount }] = await ctx.db
                    .select({ count: count() })
                    .from(userTable)
                    .where(eq(userTable.role, "admin"));

                if (adminCount <= 1) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Cannot delete the last admin",
                    });
                }
            }

            await ctx.db
                .delete(userTable)
                .where(eq(userTable.id, input.userId));

            return { success: true };
        }),

    getMods: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                offset: z.number().min(0).default(0),
                isActive: z.boolean().optional(),
                isFeatured: z.boolean().optional(),
                search: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            await requireAdmin();
            const { limit, offset, isActive, isFeatured, search } = input;

            const conditions = [];

            if (isActive !== undefined) {
                conditions.push(eq(mods.isActive, isActive));
            }

            if (isFeatured !== undefined) {
                conditions.push(eq(mods.isFeatured, isFeatured));
            }

            if (search) {
                conditions.push(
                    sql`(${mods.title} ILIKE ${`%${search}%`} OR ${
                        mods.description
                    } ILIKE ${`%${search}%`})`
                );
            }

            const result = await ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    slug: mods.slug,
                    description: mods.description,
                    version: mods.version,
                    imageUrl: mods.imageUrl,
                    isActive: mods.isActive,
                    isFeatured: mods.isFeatured,
                    createdAt: mods.createdAt,
                    author: {
                        id: userTable.id,
                        username: userTable.username,
                    },
                    game: {
                        id: games.id,
                        name: games.name,
                    },
                    category: {
                        id: categories.id,
                        name: categories.name,
                    },
                    stats: {
                        totalDownloads: modStats.totalDownloads,
                        likes: modStats.likes,
                        views: modStats.views,
                        rating: modStats.rating,
                    },
                })
                .from(mods)
                .leftJoin(userTable, eq(mods.authorId, userTable.id))
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(modStats, eq(mods.id, modStats.modId))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(mods.createdAt))
                .limit(limit)
                .offset(offset);

            const [{ count: total }] = await ctx.db
                .select({ count: count() })
                .from(mods)
                .where(conditions.length > 0 ? and(...conditions) : undefined);

            return {
                mods: result,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
            };
        }),

    updateModStatus: publicProcedure
        .input(updateModStatusInput)
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();

            const updateData: {
                isActive: boolean;
                updatedAt: Date;
                isFeatured?: boolean;
            } = {
                isActive: input.isActive,
                updatedAt: new Date(),
            };

            if (input.isFeatured !== undefined) {
                updateData.isFeatured = input.isFeatured;
            }

            const [updatedMod] = await ctx.db
                .update(mods)
                .set(updateData)
                .where(eq(mods.id, input.modId))
                .returning({
                    id: mods.id,
                    title: mods.title,
                    isActive: mods.isActive,
                    isFeatured: mods.isFeatured,
                });

            if (!updatedMod) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Mod not found",
                });
            }

            return updatedMod;
        }),
    deleteMod: publicProcedure
        .input(
            z.object({
                modId: z.number().int().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();

            const [deletedMod] = await ctx.db
                .delete(mods)
                .where(eq(mods.id, input.modId))
                .returning({ id: mods.id, title: mods.title });

            if (!deletedMod) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Mod not found",
                });
            }

            return deletedMod;
        }),

    getGames: publicProcedure.query(async ({ ctx }) => {
        await requireAdmin();

        const gamesList = await ctx.db
            .select({
                id: games.id,
                name: games.name,
                slug: games.slug,
                description: games.description,
                imageUrl: games.imageUrl,
                isActive: games.isActive,
                visibleToUsers: games.visibleToUsers,
                visibleToSupporters: games.visibleToSupporters,
                formSchema: games.formSchema,
                createdAt: games.createdAt,
                updatedAt: games.updatedAt,
            })
            .from(games)
            .orderBy(desc(games.name));

        return gamesList;
    }),    getCategories: publicProcedure.query(async ({ ctx }) => {
        await requireAdmin();

        const categoriesList = await ctx.db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                description: categories.description,
            })
            .from(categories)
            .orderBy(categories.name);

        return categoriesList;
    }),

    createGame: publicProcedure
        .input(createGameInput)
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();

            const [newGame] = await ctx.db
                .insert(games)
                .values({
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    imageUrl: input.imageUrl,
                    visibleToUsers: input.visibleToUsers,
                    visibleToSupporters: input.visibleToSupporters,
                    formSchema: input.formSchema,
                })
                .returning();

            return newGame;
        }),

    updateGame: publicProcedure
        .input(updateGameInput)
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();

            const { id, ...updateData } = input;
            const [updatedGame] = await ctx.db
                .update(games)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(games.id, id))
                .returning();

            if (!updatedGame) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Game not found",
                });
            }

            return updatedGame;
        }),

    deleteGame: publicProcedure
        .input(deleteGameInput)
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();

            const [modIds] = await ctx.db
                .select({ id: mods.id })
                .from(mods)
                .where(eq(mods.gameId, input.gameId));

            if (input.deleteMods) {
                await ctx.db.delete(mods).where(eq(mods.gameId, input.gameId));
            }

            if (!input.deleteMods && modIds) {
                const archiveTableName = `archive_${mods._.name}`;

                const tableExistsResult = await ctx.db.execute(
                    sql`SELECT to_regclass(${`public.${archiveTableName}`}) AS "tableOid"`
                );
                const archiveTableExists =
                    tableExistsResult?.[0]?.tableOid !== null;

                if (!archiveTableExists) {
                    try {
                        await ctx.db.execute(
                            sql`CREATE TABLE ${sql.identifier(
                                archiveTableName
                            )} (LIKE ${sql.identifier(
                                mods._.name
                            )} INCLUDING ALL)`
                        );
                    } catch (createError) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: `Failed to create archive table ${archiveTableName}: ${
                                createError instanceof Error
                                    ? createError.message
                                    : String(createError)
                            }`,
                        });
                    }
                }

                try {
                    await ctx.db.transaction(async (tx) => {
                        await tx.execute(sql`
                                INSERT INTO ${sql.identifier(archiveTableName)}
                                SELECT * FROM ${sql.identifier(mods._.name)}
                                WHERE ${sql.identifier(mods.gameId.name)} = ${
                            input.gameId
                        }
                            `);

                        await tx
                            .delete(mods)
                            .where(eq(mods.gameId, input.gameId));
                    });
                } catch (moveError) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: `Failed to move mods for game ${
                            input.gameId
                        } to ${archiveTableName}: ${
                            moveError instanceof Error
                                ? moveError.message
                                : String(moveError)
                        }`,
                    });
                }
            }

            const [deletedGame] = await ctx.db
                .delete(games)
                .where(eq(games.id, input.gameId))
                .returning({ id: games.id, name: games.name });

            if (!deletedGame) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Game not found",
                });
            }

            return deletedGame;
        }),

    updateMod: publicProcedure
        .input(updateModInput)
        .mutation(async ({ ctx, input }) => {
            await requireAdmin();            // Build the update data object, only including fields that were provided
            const updateData: Partial<typeof mods.$inferInsert> & { updatedAt: Date } = {
                updatedAt: new Date(),
            };

            if (input.title !== undefined) updateData.title = input.title;
            if (input.description !== undefined)
                updateData.description = input.description;
            if (input.version !== undefined) updateData.version = input.version;
            if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
            if (input.downloadUrl !== undefined)
                updateData.downloadUrl = input.downloadUrl;
            if (input.size !== undefined) updateData.size = input.size;
            if (input.gameId !== undefined) updateData.gameId = input.gameId;
            if (input.categoryId !== undefined)
                updateData.categoryId = input.categoryId;

            // If title is being updated, generate a new slug
            if (input.title) {
                updateData.slug = input.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
            }

            const [updatedMod] = await ctx.db
                .update(mods)
                .set(updateData)
                .where(eq(mods.id, input.modId))
                .returning();

            if (!updatedMod) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Mod not found",
                });
            }

            return updatedMod;
        }),

    getMod: publicProcedure
        .input(z.object({ modId: z.number().int().positive() }))
        .query(async ({ ctx, input }) => {
            await requireAdmin();

            const mod = await ctx.db
                .select({
                    id: mods.id,
                    title: mods.title,
                    description: mods.description,
                    version: mods.version,
                    imageUrl: mods.imageUrl,
                    downloadUrl: mods.downloadUrl,
                    size: mods.size,
                    gameId: mods.gameId,
                    categoryId: mods.categoryId,
                    isActive: mods.isActive,
                    isFeatured: mods.isFeatured,
                    createdAt: mods.createdAt,
                    updatedAt: mods.updatedAt,
                    game: {
                        id: games.id,
                        name: games.name,
                    },
                    category: {
                        id: categories.id,
                        name: categories.name,
                    },
                    author: {
                        id: userTable.id,
                        username: userTable.username,
                    },
                })
                .from(mods)
                .leftJoin(games, eq(mods.gameId, games.id))
                .leftJoin(categories, eq(mods.categoryId, categories.id))
                .leftJoin(userTable, eq(mods.authorId, userTable.id))
                .where(eq(mods.id, input.modId))
                .limit(1);

            if (!mod[0]) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Mod not found",
                });
            }

            return mod[0];
        }),
});
