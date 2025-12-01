ALTER TABLE "emoji-roulette_roulette_participant"
  ADD COLUMN "position" integer NOT NULL DEFAULT 0;

-- Backfill deterministic order based on current insertion order per roulette
UPDATE "emoji-roulette_roulette_participant" p
SET position = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY roulette_id ORDER BY id) AS rn
  FROM "emoji-roulette_roulette_participant"
) sub
WHERE p.id = sub.id;
