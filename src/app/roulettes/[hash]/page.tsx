import { Roulette } from "@/components/roulette";
import { api } from "@/trpc/server";

type Props = {
  params?: {
    hash?: string;
  };
};
export default async function Home({ params }: Props) {
  const roulette = await api.roulette.getRouletteByHash({
    hash: params?.hash ?? "",
  });

  return <Roulette roulette={roulette} />;
}
