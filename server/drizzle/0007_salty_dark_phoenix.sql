CREATE TABLE "ai_agents" (
	"id" text PRIMARY KEY NOT NULL,
	"licenseId" text NOT NULL,
	"name" text NOT NULL,
	"behavior" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_licenseId_license_id_fk" FOREIGN KEY ("licenseId") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;