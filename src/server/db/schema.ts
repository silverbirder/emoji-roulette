import {
  index,
  pgTableCreator,
  serial,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `emoji-roulette_${name}`);

export const roulettes = createTable(
  "roulette",
  {
    id: serial("id").primaryKey(),
    hash: varchar("hash", { length: 256 }).notNull(),
  },
  (roulette) => ({
    hashIndex: index("hash_idx").on(roulette.hash),
  }),
);

// ルーレット参加者テーブル
export const rouletteParticipants = createTable(
  "roulette_participant",
  {
    id: serial("id").primaryKey(),
    participantName: varchar("participant_name", { length: 256 }).notNull(),
    emoji: varchar("emoji", { length: 2 }).notNull(),
    isHit: boolean("is_hit").default(false),
    rouletteId: serial("roulette_id")
      .references(() => roulettes.id)
      .notNull(),
  },
  (participant) => ({
    rouletteIdIndex: index("roulette_id_idx").on(participant.rouletteId),
  }),
);
