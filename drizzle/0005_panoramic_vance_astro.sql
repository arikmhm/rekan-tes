ALTER TABLE "orders" ADD COLUMN "granted_by" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "grant_reason" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "replaces_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_replaces_order_id_orders_id_fk" FOREIGN KEY ("replaces_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_grant_reason_with_granter" CHECK (("orders"."granted_by" is null and "orders"."grant_reason" is null) or ("orders"."granted_by" is not null and "orders"."grant_reason" is not null));