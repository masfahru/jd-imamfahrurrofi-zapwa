CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	"url" text,
	"description" text,
	"availability" text DEFAULT 'in stock' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"priceAmount1000" integer NOT NULL,
	"salePriceAmount1000" integer,
	"retailerId" text,
	"imageCdnUrls" jsonb,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;