CREATE TABLE "license" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"userId" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "license_key_unique" UNIQUE("key"),
	CONSTRAINT "license_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "license" ADD CONSTRAINT "license_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;