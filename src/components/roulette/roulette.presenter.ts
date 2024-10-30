"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSConfetti from "js-confetti";

export interface Participant {
  name: string;
  emoji: string;
}

export function useRoulettePresenter() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const jsConfettiRef = useRef<JSConfetti | null>(null);

  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
  }, []);

  const addParticipant = useCallback(() => {
    if (
      newParticipantName &&
      !participants.some((p) => p.name === newParticipantName)
    ) {
      setParticipants((prev) => [
        ...prev,
        { name: newParticipantName, emoji: "😊" },
      ]);
      setNewParticipantName("");
    }
  }, [newParticipantName, participants]);

  const removeParticipant = useCallback((participant: Participant) => {
    setParticipants((prev) => prev.filter((p) => p.name !== participant.name));
  }, []);

  const celebrateWinner = useCallback(async (emoji: string) => {
    if (jsConfettiRef.current) {
      await jsConfettiRef.current.addConfetti({
        emojis: [emoji],
        emojiSize: 50,
        confettiNumber: 30,
      });
      await jsConfettiRef.current.addConfetti({
        emojis: ["🎉", "🎊", "✨", "⭐", "🌟"],
        emojiSize: 30,
        confettiNumber: 50,
      });
    }
  }, []);

  const spinRoulette = useCallback(() => {
    if (participants.length > 1 && !isSpinning) {
      setIsSpinning(true);
      setWinner(null);
      setTimeout(() => {
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const selectedWinner = participants[winnerIndex];
        setIsSpinning(false);
        if (selectedWinner) {
          setWinner(selectedWinner);
          void celebrateWinner(selectedWinner.emoji);
        }
        setParticipants((prev) =>
          prev.filter((_, index) => index !== winnerIndex),
        );
      }, 5000);
    }
  }, [participants, isSpinning, celebrateWinner]);

  const resetSelection = useCallback(() => {
    setWinner(null);
  }, []);

  const wheelData = useMemo(
    () => participants.map((p) => ({ option: `${p.name} ${p.emoji}` })),
    [participants],
  );

  return {
    participants,
    newParticipantName,
    showEmojiPicker,
    isSpinning,
    winner,
    setNewParticipantName,
    setShowEmojiPicker,
    addParticipant,
    removeParticipant,
    spinRoulette,
    resetSelection,
    wheelData,
    setIsSpinning,
  };
}
