import { z } from "zod";
import { randomBytes } from "crypto";

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
      const roulette = await ctx.db.query.roulettes.findFirst({
        where: (roulettes, { eq }) => eq(roulettes.hash, input.hash),
      });

      return roulette ?? null;
    }),
});
