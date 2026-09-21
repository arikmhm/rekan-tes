CREATE TABLE "banners" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"alt" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "banners_position_idx" ON "banners" USING btree ("position");