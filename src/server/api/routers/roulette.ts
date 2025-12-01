import { z } from "zod";
import { randomBytes } from "crypto";
import { eq, and, notInArray } from "drizzle-orm/expressions";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { roulettes, rouletteParticipants } from "@/server/db/schema";

export const rouletteRouter = createTRPCRouter({
  saveRoulette: publicProcedure
    .input(
      z.object({
        hash: z.string().optional(),
        autoSaveEnabled: z.boolean().optional(),
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
      const { hash: _hash, participants } = input;
      const autoSaveEnabled = input.autoSaveEnabled ?? false;

      let rouletteId;
      let hash;

      if (_hash) {
        const roulette = await ctx.db
          .select({ id: roulettes.id })
          .from(roulettes)
          .where(eq(roulettes.hash, _hash))
          .execute();

        if (roulette.length === 0) {
          throw new Error("ルーレットが見つかりませんでした");
        }

        hash = _hash;
        rouletteId = roulette[0]?.id ?? 0;
      } else {
        hash = randomBytes(16).toString("hex");
        const [newRoulette] = await ctx.db
          .insert(roulettes)
          .values({ hash, autoSaveEnabled })
          .returning();

        rouletteId = newRoulette?.id;
      }

      if (rouletteId) {
        const updatedParticipantIds: number[] = [];

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
            updatedParticipantIds.push(participant.id);
          } else {
            const [newParticipant] = await ctx.db
              .insert(rouletteParticipants)
              .values({
                participantName: participant.participantName,
                emoji: participant.emoji,
                isHit: participant.isHit,
                rouletteId,
              })
              .returning();
            if (newParticipant?.id) {
              updatedParticipantIds.push(newParticipant.id);
            }
          }
        }

        await ctx.db
          .update(roulettes)
          .set({ autoSaveEnabled })
          .where(eq(roulettes.id, rouletteId));

        await ctx.db
          .delete(rouletteParticipants)
          .where(
            and(
              eq(rouletteParticipants.rouletteId, rouletteId),
              notInArray(rouletteParticipants.id, updatedParticipantIds),
            ),
          );
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
