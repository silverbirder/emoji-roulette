import { z } from "zod";
import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm/expressions";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { roulettes, rouletteParticipants } from "@/server/db/schema";

export const rouletteRouter = createTRPCRouter({
  saveRoulette: publicProcedure
    .input(
      z.object({
        id: z.number().optional(),
        participants: z.array(
          z.object({
            id: z.number().optional(),
            participantName: z.string().min(1),
            emoji: z.string().min(1),
            isHit: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, participants } = input;

      let rouletteId;
      let hash;

      if (id) {
        const roulette = await ctx.db
          .select({ hash: roulettes.hash })
          .from(roulettes)
          .where(eq(roulettes.id, id))
          .execute();

        if (roulette.length === 0) {
          throw new Error("ルーレットが見つかりませんでした");
        }

        hash = roulette[0]?.hash ?? "";
        rouletteId = id;
      } else {
        hash = randomBytes(16).toString("hex");
        const [newRoulette] = await ctx.db
          .insert(roulettes)
          .values({ hash })
          .returning();

        rouletteId = newRoulette?.id;
      }

      if (rouletteId) {
        for (const participant of participants) {
          if (participant.id) {
            await ctx.db
              .update(rouletteParticipants)
              .set({
                participantName: participant.participantName,
                emoji: participant.emoji,
                isHit: participant.isHit,
              })
              .where(
                and(
                  eq(rouletteParticipants.id, participant.id),
                  eq(rouletteParticipants.rouletteId, rouletteId),
                ),
              );
          } else {
            await ctx.db.insert(rouletteParticipants).values({
              participantName: participant.participantName,
              emoji: participant.emoji,
              isHit: participant.isHit,
              rouletteId,
            });
          }
        }
      }

      return { hash, id: rouletteId };
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
