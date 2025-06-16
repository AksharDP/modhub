import {
    pgTable,
    text,
    integer,
    real,
    index,
    serial,
    boolean,
    timestamp,
    pgEnum,
    json,
} from "drizzle-orm/pg-core";

// Form field interface for game form schemas
export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file' | 'static-text';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    content?: string;
    color?: string;
    order: number;
}

export const userRoleEnum = pgEnum("user_role", ["admin", "user", "supporter", "banned", "suspended"]);
export const userTable = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        username: text("username").notNull().unique(),
        email: text("email").notNull().unique(),
        passwordHash: text("password_hash").notNull(),
        role: userRoleEnum("role").default("user").notNull(),
        profilePicture: text("profile_picture").default(
            "https://placehold.co/30x30/png"
        ),
        bio: text("bio"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
        suspendedUntil: timestamp("suspended_until", { withTimezone: true }),
    },
    (table) => ({
        usernameIdx: index("username_idx").on(table.username),
        emailIdx: index("email_idx").on(table.email),
        roleIdx: index("role_idx").on(table.role),
    })
);

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const games = pgTable(
    "games",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull().unique(),
        slug: text("slug").notNull().unique(),
        description: text("description"),
        imageUrl: text("image_url"),
        isActive: boolean("is_active").default(true),
        visibleToUsers: boolean("visible_to_users").default(true),
        visibleToSupporters: boolean("visible_to_supporters").default(true),
        formSchema: json("form_schema").$type<FormField[]>().default([]),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        gameSlugIdx: index("game_slug_idx").on(table.slug),
        gameActiveIdx: index("game_active_idx").on(table.isActive),
    })
);

export const categories = pgTable(
    "categories",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull().unique(),
        slug: text("slug").notNull().unique(),
        description: text("description"),
        color: text("color").default("#6B7280"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        categorySlugIdx: index("category_slug_idx").on(table.slug),
    })
);

export const mods = pgTable(
    "mods",
    {
        id: serial("id").primaryKey(),
        title: text("title").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description").notNull(),
        version: text("version").notNull().default("1.0.0"),
        imageUrl: text("image_url"),
        downloadUrl: text("download_url"),
        size: text("size").default("N/A"),
        isActive: boolean("is_active").default(true),
        isFeatured: boolean("is_featured").default(false),

        authorId: integer("author_id")
            .notNull()
            .references(() => userTable.id),
        gameId: integer("game_id")
            .notNull()
            .references(() => games.id),
        categoryId: integer("category_id")
            .notNull()
            .references(() => categories.id),

        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        featuredModsIdx: index("featured_mods_idx").on(
            table.isFeatured,
            table.isActive
        ),
        modsCreatedAtIdx: index("mods_created_at_idx").on(table.createdAt),
        modsUpdatedAtIdx: index("mods_updated_at_idx").on(table.updatedAt),
        modsAuthorIdx: index("mods_author_idx").on(table.authorId),
        modsGameIdx: index("mods_game_idx").on(table.gameId),
        modsCategoryIdx: index("mods_category_idx").on(table.categoryId),
        modsActiveIdx: index("mods_active_idx").on(table.isActive),
        modsGameCategoryIdx: index("mods_game_category_idx").on(
            table.gameId,
            table.categoryId,
            table.isActive
        ),
    })
);

export const modTags = pgTable("mod_tags", {
    id: serial("id").primaryKey(),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
});

export const modImages = pgTable("mod_images", {
    id: serial("id").primaryKey(),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    order: integer("order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const modFiles = pgTable("mod_files", {
    id: serial("id").primaryKey(),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: text("file_size"),
    version: text("version").notNull(),
    isMainFile: boolean("is_main_file").default(false),
    downloadCount: integer("download_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const modStats = pgTable(
    "mod_stats",
    {
        id: serial("id").primaryKey(),
        modId: integer("mod_id")
            .notNull()
            .references(() => mods.id, { onDelete: "cascade" })
            .unique(),
        totalDownloads: integer("total_downloads").default(0),
        weeklyDownloads: integer("weekly_downloads").default(0),
        monthlyDownloads: integer("monthly_downloads").default(0),
        likes: integer("likes").default(0),
        views: integer("views").default(0),
        rating: real("rating").default(0),
        ratingCount: integer("rating_count").default(0),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        statsDownloadsIdx: index("stats_downloads_idx").on(
            table.totalDownloads
        ),
        statsLikesIdx: index("stats_likes_idx").on(table.likes),
        statsRatingIdx: index("stats_rating_idx").on(table.rating),
        statsModIdx: index("stats_mod_idx").on(table.modId),
    })
);

export const userModLikes = pgTable("user_mod_likes", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userModRatings = pgTable("user_mod_ratings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userModDownloads = pgTable("user_mod_downloads", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => userTable.id),
    modId: integer("mod_id")
        .notNull()
        .references(() => mods.id, { onDelete: "cascade" }),
    fileId: integer("file_id").references(() => modFiles.id),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userFollows = pgTable("user_follows", {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const collections = pgTable(
    "collections",
    {
        id: serial("id").primaryKey(),
        userId: integer("user_id").references(() => userTable.id, { onDelete: "cascade" }).notNull(),
        name: text("name").notNull(),
        description: text("description"),
        isPublic: boolean("is_public").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        userIdIdx: index("idx_collections_user_id").on(table.userId),
        isPublicIdx: index("idx_collections_is_public").on(table.isPublic),
    })
);

export const collectionMods = pgTable(
    "collection_mods",
    {
        collectionId: integer("collection_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
        modId: integer("mod_id").references(() => mods.id, { onDelete: "cascade" }).notNull(),
        addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
        order: integer("order"), // New column for custom order
    },
    (table) => ({
        pk: index("collection_mods_pk").on(table.collectionId, table.modId),
        modIdIdx: index("idx_collection_mods_mod_id").on(table.modId),
    })
);

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Mod = typeof mods.$inferSelect;
export type NewMod = typeof mods.$inferInsert;

export type ModTag = typeof modTags.$inferSelect;
export type NewModTag = typeof modTags.$inferInsert;

export type ModImage = typeof modImages.$inferSelect;
export type NewModImage = typeof modImages.$inferInsert;

export type ModFile = typeof modFiles.$inferSelect;
export type NewModFile = typeof modFiles.$inferInsert;

export type ModStats = typeof modStats.$inferSelect;
export type NewModStats = typeof modStats.$inferInsert;

export type UserModLike = typeof userModLikes.$inferSelect;
export type NewUserModLike = typeof userModLikes.$inferInsert;

export type UserModRating = typeof userModRatings.$inferSelect;
export type NewUserModRating = typeof userModRatings.$inferInsert;

export type UserModDownload = typeof userModDownloads.$inferSelect;
export type NewUserModDownload = typeof userModDownloads.$inferInsert;

export type UserFollow = typeof userFollows.$inferSelect;
export type NewUserFollow = typeof userFollows.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type CollectionMod = typeof collectionMods.$inferSelect;
export type NewCollectionMod = typeof collectionMods.$inferInsert;
