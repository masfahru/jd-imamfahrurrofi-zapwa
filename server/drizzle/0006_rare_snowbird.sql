CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"toolCalls" jsonb,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"licenseId" text NOT NULL,
	"customerIdentifier" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_chat_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_licenseId_license_id_fk" FOREIGN KEY ("licenseId") REFERENCES "public"."license"("id") ON DELETE cascade ON UPDATE no action;