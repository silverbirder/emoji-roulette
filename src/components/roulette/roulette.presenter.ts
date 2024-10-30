import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSConfetti from "js-confetti";

export interface Participant {
  name: string;
  emoji: string;
  isHit: boolean;
}

export function useRoulettePresenter() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const jsConfettiRef = useRef<JSConfetti | null>(null);

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
      !participants.some((p) => p.name === newParticipantName)
    ) {
      setParticipants((prev) => [
        ...prev,
        { name: newParticipantName, emoji: "😊", isHit: false },
      ]);
      setNewParticipantName("");
    }
  }, [newParticipantName, participants]);

  const removeParticipant = useCallback((participant: Participant) => {
    setParticipants((prev) => prev.filter((p) => p.name !== participant.name));
  }, []);

  const handleEmojiClick = useCallback(
    (emojiObject: { emoji: string }) => {
      if (selectedParticipant) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.name === selectedParticipant.name
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
        (p) => p.name === randomParticipant?.name,
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

  const wheelData = useMemo(
    () =>
      participants.map((p) => ({
        option: `${p.name} ${p.emoji}`,
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
  };
}
