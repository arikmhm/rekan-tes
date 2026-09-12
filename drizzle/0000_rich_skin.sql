CREATE TYPE "public"."attempt_status" AS ENUM('not_started', 'in_progress', 'submitted', 'submitted_by_timeout', 'expired');--> statement-breakpoint
CREATE TYPE "public"."attempt_subtest_status" AS ENUM('not_started', 'in_progress', 'submitted', 'submitted_by_timeout');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'expired', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_subtest_id" text NOT NULL,
	"test_subtest_question_id" text NOT NULL,
	"selected_option_id" text,
	"is_correct" boolean,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_subtests" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"test_subtest_id" text NOT NULL,
	"status" "attempt_subtest_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"test_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"access_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_amount_non_negative" CHECK ("orders"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"request_id" text NOT NULL,
	"checkout_url" text,
	"expires_at" timestamp with time zone,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_non_negative" CHECK ("payments"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "question_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"label" text NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_options_position_positive" CHECK ("question_options"."position" > 0)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"prompt" text NOT NULL,
	"difficulty" "question_difficulty" DEFAULT 'medium' NOT NULL,
	"explanation" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtests" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subtests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"status" "attempt_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"final_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_attempts_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "test_subtest_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_subtest_id" text NOT NULL,
	"question_id" text NOT NULL,
	"position" integer NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_subtest_questions_position_positive" CHECK ("test_subtest_questions"."position" > 0),
	CONSTRAINT "test_subtest_questions_weight_positive" CHECK ("test_subtest_questions"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "test_subtests" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"subtest_id" text NOT NULL,
	"position" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"question_limit" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_subtests_position_positive" CHECK ("test_subtests"."position" > 0),
	CONSTRAINT "test_subtests_duration_positive" CHECK ("test_subtests"."duration_seconds" > 0),
	CONSTRAINT "test_subtests_question_limit_positive" CHECK ("test_subtests"."question_limit" > 0)
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price_amount" integer NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tests_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tests_price_amount_non_negative" CHECK ("tests"."price_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_subtest_id_attempt_subtests_id_fk" FOREIGN KEY ("attempt_subtest_id") REFERENCES "public"."attempt_subtests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_test_subtest_question_id_test_subtest_questions_id_fk" FOREIGN KEY ("test_subtest_question_id") REFERENCES "public"."test_subtest_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_subtests" ADD CONSTRAINT "attempt_subtests_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_subtests" ADD CONSTRAINT "attempt_subtests_test_subtest_id_test_subtests_id_fk" FOREIGN KEY ("test_subtest_id") REFERENCES "public"."test_subtests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_question_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."question_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtests" ADD CONSTRAINT "subtests_category_id_question_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."question_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_subtest_questions" ADD CONSTRAINT "test_subtest_questions_test_subtest_id_test_subtests_id_fk" FOREIGN KEY ("test_subtest_id") REFERENCES "public"."test_subtests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_subtest_questions" ADD CONSTRAINT "test_subtest_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_subtests" ADD CONSTRAINT "test_subtests_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_subtests" ADD CONSTRAINT "test_subtests_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_answers_subtest_question_key" ON "attempt_answers" USING btree ("attempt_subtest_id","test_subtest_question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_subtests_attempt_subtest_key" ON "attempt_subtests" USING btree ("attempt_id","test_subtest_id");--> statement-breakpoint
CREATE INDEX "orders_user_created_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_external_id_key" ON "payments" USING btree ("provider","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_request_id_key" ON "payments" USING btree ("provider","request_id");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_options_question_position_key" ON "question_options" USING btree ("question_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "question_options_single_correct_key" ON "question_options" USING btree ("question_id") WHERE "question_options"."is_correct";--> statement-breakpoint
CREATE INDEX "questions_category_status_difficulty_idx" ON "questions" USING btree ("category_id","status","difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "test_subtest_questions_subtest_question_key" ON "test_subtest_questions" USING btree ("test_subtest_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_subtest_questions_subtest_position_key" ON "test_subtest_questions" USING btree ("test_subtest_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "test_subtests_test_subtest_key" ON "test_subtests" USING btree ("test_id","subtest_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_subtests_test_position_key" ON "test_subtests" USING btree ("test_id","position");