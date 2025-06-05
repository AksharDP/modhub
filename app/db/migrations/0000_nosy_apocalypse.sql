CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6B7280',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "games_name_unique" UNIQUE("name"),
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mod_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"mod_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" text,
	"version" text NOT NULL,
	"is_main_file" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mod_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"mod_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mod_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"mod_id" integer NOT NULL,
	"total_downloads" integer DEFAULT 0,
	"weekly_downloads" integer DEFAULT 0,
	"monthly_downloads" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mod_stats_mod_id_unique" UNIQUE("mod_id")
);
--> statement-breakpoint
CREATE TABLE "mod_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"mod_id" integer NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mods" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"image_url" text,
	"download_url" text,
	"size" text DEFAULT 'N/A',
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"author_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mods_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_mod_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"mod_id" integer NOT NULL,
	"file_id" integer,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_mod_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mod_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_mod_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mod_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"profile_picture" text DEFAULT 'https://placehold.co/30x30/png',
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "mod_files" ADD CONSTRAINT "mod_files_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mod_images" ADD CONSTRAINT "mod_images_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mod_stats" ADD CONSTRAINT "mod_stats_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mod_tags" ADD CONSTRAINT "mod_tags_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mods" ADD CONSTRAINT "mods_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mods" ADD CONSTRAINT "mods_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mods" ADD CONSTRAINT "mods_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_downloads" ADD CONSTRAINT "user_mod_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_downloads" ADD CONSTRAINT "user_mod_downloads_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_downloads" ADD CONSTRAINT "user_mod_downloads_file_id_mod_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."mod_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_likes" ADD CONSTRAINT "user_mod_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_likes" ADD CONSTRAINT "user_mod_likes_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_ratings" ADD CONSTRAINT "user_mod_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mod_ratings" ADD CONSTRAINT "user_mod_ratings_mod_id_mods_id_fk" FOREIGN KEY ("mod_id") REFERENCES "public"."mods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "game_slug_idx" ON "games" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "game_active_idx" ON "games" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "stats_downloads_idx" ON "mod_stats" USING btree ("total_downloads");--> statement-breakpoint
CREATE INDEX "stats_likes_idx" ON "mod_stats" USING btree ("likes");--> statement-breakpoint
CREATE INDEX "stats_rating_idx" ON "mod_stats" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "stats_mod_idx" ON "mod_stats" USING btree ("mod_id");--> statement-breakpoint
CREATE INDEX "featured_mods_idx" ON "mods" USING btree ("is_featured","is_active");--> statement-breakpoint
CREATE INDEX "mods_created_at_idx" ON "mods" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mods_updated_at_idx" ON "mods" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "mods_author_idx" ON "mods" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "mods_game_idx" ON "mods" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "mods_category_idx" ON "mods" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "mods_active_idx" ON "mods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "mods_game_category_idx" ON "mods" USING btree ("game_id","category_id","is_active");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");