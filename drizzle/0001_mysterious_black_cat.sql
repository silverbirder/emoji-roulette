CREATE TABLE IF NOT EXISTS "emoji-roulette_roulette_participant" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_name" varchar(256) NOT NULL,
	"emoji" varchar(2) NOT NULL,
	"is_hit" boolean DEFAULT false,
	"roulette_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emoji-roulette_roulette" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" varchar(256) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emoji-roulette_roulette_participant" ADD CONSTRAINT "emoji-roulette_roulette_participant_roulette_id_emoji-roulette_roulette_id_fk" FOREIGN KEY ("roulette_id") REFERENCES "public"."emoji-roulette_roulette"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "roulette_id_idx" ON "emoji-roulette_roulette_participant" USING btree ("roulette_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hash_idx" ON "emoji-roulette_roulette" USING btree ("hash");