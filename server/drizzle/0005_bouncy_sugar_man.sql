ALTER TABLE "customer" RENAME COLUMN "userId" TO "licenseId";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "userId" TO "licenseId";--> statement-breakpoint
ALTER TABLE "product" RENAME COLUMN "userId" TO "licenseId";--> statement-breakpoint
ALTER TABLE "customer" DROP CONSTRAINT "customer_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_licenseId_license_id_fk" FOREIGN KEY ("licenseId") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_licenseId_license_id_fk" FOREIGN KEY ("licenseId") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_licenseId_license_id_fk" FOREIGN KEY ("licenseId") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;