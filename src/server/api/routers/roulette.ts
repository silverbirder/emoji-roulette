import { z } from "zod";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm/expressions";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { roulettes, rouletteParticipants } from "@/server/db/schema";

export const rouletteRouter = createTRPCRouter({
  saveRoulette: publicProcedure
    .input(
      z.object({
        participants: z.array(
          z.object({
            participantName: z.string().min(1),
            emoji: z.string().min(1),
            isHit: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { participants } = input;

      const hash = randomBytes(16).toString("hex");

      const [roulette] = await ctx.db
        .insert(roulettes)
        .values({
          hash,
        })
        .returning();

      await ctx.db.insert(rouletteParticipants).values(
        participants.map((participant) => ({
          participantName: participant.participantName,
          emoji: participant.emoji,
          isHit: participant.isHit,
          rouletteId: roulette?.id,
        })),
      );

      return { hash };
    }),

  getRouletteByHash: publicProcedure
    .input(z.object({ hash: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          roulette: roulettes,
          participant: rouletteParticipants,
        })
        .from(roulettes)
        .leftJoin(
          rouletteParticipants,
          eq(roulettes.id, rouletteParticipants.rouletteId),
        )
        .where(eq(roulettes.hash, input.hash));

      const rouletteData = result.reduce<{
        roulette: typeof roulettes.$inferSelect | null;
        participants: (typeof rouletteParticipants.$inferSelect)[];
      }>(
        (acc, row) => {
          const { roulette, participant } = row;
          if (!acc.roulette) {
            acc.roulette = roulette;
          }
          if (participant) {
            acc.participants.push(participant);
          }
          return acc;
        },
        { roulette: null, participants: [] },
      );

      return rouletteData.roulette
        ? {
            ...rouletteData.roulette,
            participants: rouletteData.participants,
          }
        : null;
    }),
});
