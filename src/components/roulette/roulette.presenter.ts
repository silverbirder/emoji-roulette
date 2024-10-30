import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSConfetti from "js-confetti";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export interface Participant {
  participantName: string;
  emoji: string;
  isHit: boolean;
}

type Props = {
  roulette?: {
    id: number;
    hash: string;
    participants: {
      id: number;
      participantName: string;
      emoji: string;
      isHit: boolean | null;
      rouletteId: number;
    }[];
  } | null;
};

export function useRoulettePresenter({ roulette }: Props) {
  const [participants, setParticipants] = useState<Participant[]>(
    roulette?.participants.map((participant) => ({
      ...participant,
      isHit: !!participant.isHit,
    })) ?? [],
  );
  const [newParticipantName, setNewParticipantName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const jsConfettiRef = useRef<JSConfetti | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
  }, []);

  const updateNewParticipantName = useCallback((name: string) => {
    setNewParticipantName(name);
  }, []);

  const toggleEmojiPicker = useCallback((show: boolean) => {
    setShowEmojiPicker(show);
  }, []);

  const selectParticipantForEmoji = useCallback(
    (participant: Participant | null) => {
      setSelectedParticipant(participant);
    },
    [],
  );

  const addParticipant = useCallback(() => {
    if (
      newParticipantName &&
      !participants.some((p) => p.participantName === newParticipantName)
    ) {
      setParticipants((prev) => [
        ...prev,
        { participantName: newParticipantName, emoji: "😊", isHit: false },
      ]);
      setNewParticipantName("");
    }
  }, [newParticipantName, participants]);

  const removeParticipant = useCallback((participant: Participant) => {
    setParticipants((prev) =>
      prev.filter((p) => p.participantName !== participant.participantName),
    );
  }, []);

  const handleEmojiClick = useCallback(
    (emojiObject: { emoji: string }) => {
      if (selectedParticipant) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.participantName === selectedParticipant.participantName
              ? { ...p, emoji: emojiObject.emoji }
              : p,
          ),
        );
        setShowEmojiPicker(false);
        setSelectedParticipant(null);
      }
    },
    [selectedParticipant],
  );

  const spinRoulette = useCallback(() => {
    const availableParticipants = participants.filter((p) => !p.isHit);
    if (availableParticipants.length > 1 && !isSpinning) {
      const randomParticipant =
        availableParticipants[
          Math.floor(Math.random() * availableParticipants.length)
        ];
      const globalIndex = participants.findIndex(
        (p) => p.participantName === randomParticipant?.participantName,
      );
      setPrizeNumber(globalIndex);
      setIsSpinning(true);
      setWinner(null);
    }
  }, [participants, isSpinning]);

  const selectWinner = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p, index) =>
        index === prizeNumber ? { ...p, isHit: true } : p,
      ),
    );
    const selectedWinner = participants[prizeNumber];
    if (selectedWinner) {
      setWinner(selectedWinner);
      void jsConfettiRef.current?.addConfetti({
        emojis: Array(100).fill(selectedWinner.emoji),
        emojiSize: 40,
        confettiNumber: 500,
      });
    }
    setIsSpinning(false);
  }, [participants, prizeNumber]);

  const resetSelection = useCallback(() => {
    setParticipants((prev) => prev.map((p) => ({ ...p, isHit: false })));
    setWinner(null);
  }, []);

  const saveRoulette = api.roulette.saveRoulette.useMutation({
    onSuccess: ({ hash }) => {
      toast({
        title: "State Saved",
        description: "The current roulette state has been saved.",
      });
      router.push(`/roulettes/${hash}`);
    },
  });

  const saveState = useCallback(() => {
    saveRoulette.mutate({
      id: roulette?.id,
      participants,
    });
  }, [participants, saveRoulette, roulette?.id]);

  const wheelData = useMemo(
    () =>
      participants.map((p) => ({
        option: `${p.participantName} ${p.emoji}`,
        style: p.isHit ? { backgroundColor: "gray", textColor: "white" } : {},
      })),
    [participants],
  );

  return {
    participants,
    newParticipantName,
    showEmojiPicker,
    selectedParticipant,
    isSpinning,
    winner,
    prizeNumber,
    updateNewParticipantName,
    toggleEmojiPicker,
    selectParticipantForEmoji,
    addParticipant,
    removeParticipant,
    handleEmojiClick,
    spinRoulette,
    resetSelection,
    selectWinner,
    wheelData,
    saveState,
  };
}
