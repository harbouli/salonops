CREATE TYPE "public"."role" AS ENUM('OWNER', 'MANAGER', 'STYLIST', 'RECEPTIONIST');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('BOOKED', 'CONFIRMED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'TPE_CARD', 'SPLIT');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(128) DEFAULT 'Béni Mellal' NOT NULL,
	"address" text,
	"phone" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'STYLIST' NOT NULL,
	"avatar_url" text,
	"commission_pct" double precision DEFAULT 15 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_day_off" boolean DEFAULT false NOT NULL,
	"working_start" varchar(16) DEFAULT '09:00' NOT NULL,
	"working_end" varchar(16) DEFAULT '19:30' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"name_fr" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"buffer_minutes" integer DEFAULT 10 NOT NULL,
	"price_mad" numeric(10, 2) NOT NULL,
	"deposit_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"loyalty_points" integer DEFAULT 0 NOT NULL,
	"preferences" text[],
	"scalp_alert" text,
	"allergies" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"stylist_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"buffer_end_time" timestamp with time zone NOT NULL,
	"price_mad" numeric(10, 2) NOT NULL,
	"status" "appointment_status" DEFAULT 'BOOKED' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hair_formulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"appointment_id" uuid,
	"stylist_id" uuid NOT NULL,
	"visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"brand" varchar(128) NOT NULL,
	"shade_formula" text NOT NULL,
	"developer_volume" varchar(64) NOT NULL,
	"processing_time_minutes" integer NOT NULL,
	"before_photo_url" text,
	"after_photo_url" text,
	"scalp_alert" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"appointment_id" uuid,
	"stylist_id" uuid NOT NULL,
	"client_id" uuid,
	"service_total_mad" numeric(10, 2) NOT NULL,
	"retail_total_mad" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"tip_amount_mad" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'CASH' NOT NULL,
	"cash_amount_mad" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"card_amount_mad" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"stylist_commission_mad" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_stylist_id_users_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hair_formulas" ADD CONSTRAINT "hair_formulas_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hair_formulas" ADD CONSTRAINT "hair_formulas_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hair_formulas" ADD CONSTRAINT "hair_formulas_stylist_id_users_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_stylist_id_users_id_fk" FOREIGN KEY ("stylist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;