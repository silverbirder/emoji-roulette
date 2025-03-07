import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSConfetti from "js-confetti";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";

export interface Participant {
  uuid: string;
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
      uuid: uuidv4(),
      participantName: participant.participantName,
      emoji: participant.emoji,
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
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [savedUrl, setSavedUrl] = useState("");

  const jsConfettiRef = useRef<JSConfetti | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

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
    if (newParticipantName) {
      setParticipants((prev) => [
        ...prev,
        {
          uuid: uuidv4(),
          participantName: newParticipantName,
          emoji: "😊",
          isHit: false,
        },
      ]);
      setNewParticipantName("");
    }
  }, [newParticipantName]);

  const removeParticipant = useCallback((uuid: string) => {
    setParticipants((prev) => prev.filter((p) => p.uuid !== uuid));
  }, []);

  const handleEmojiClick = useCallback(
    (emojiObject: { emoji: string }) => {
      if (selectedParticipant) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.uuid === selectedParticipant.uuid
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

  const toggleParticipantHit = useCallback((uuid: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, isHit: !p.isHit } : p)),
    );
  }, []);

  const editParticipantName = useCallback((uuid: string, newName: string) => {
    if (newName) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.uuid === uuid ? { ...p, participantName: newName } : p,
        ),
      );
    }
  }, []);

  const handleChangeEditName = useCallback((editName: string) => {
    setEditName(editName);
  }, []);

  const handleEditClick = useCallback(
    (uuid: string, participantName: string) => {
      setEditingParticipant(uuid);
      setEditName(participantName);
    },
    [],
  );

  const handleEditSubmit = useCallback(
    (uuid: string) => {
      editParticipantName(uuid, editName);
      setEditingParticipant(null);
      setEditName("");
    },
    [editParticipantName, editName],
  );

  const handleEmojiButtonClick = useCallback(
    (participant: Participant, event: React.MouseEvent<HTMLButtonElement>) => {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setEmojiPickerPosition({
        top: buttonRect.top + window.scrollY + buttonRect.height,
        left: buttonRect.left + window.scrollX,
      });
      toggleEmojiPicker(true);
      selectParticipantForEmoji(participant);
    },
    [toggleEmojiPicker, selectParticipantForEmoji],
  );

  const spinRoulette = useCallback(() => {
    const availableParticipants = participants.filter((p) => !p.isHit);
    if (availableParticipants.length > 0 && !isSpinning) {
      const randomParticipant =
        availableParticipants[
          Math.floor(Math.random() * availableParticipants.length)
        ];
      const globalIndex = participants.findIndex(
        (p) => p.uuid === randomParticipant?.uuid,
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
      const newUrl = `/roulettes/${hash}?showAlert=true`;
      router.push(newUrl);
    },
  });

  const saveState = useCallback(() => {
    saveRoulette.mutate({
      hash: roulette?.hash,
      participants,
    });
  }, [participants, saveRoulette, roulette?.hash]);

  const closeSuccessAlert = useCallback(() => {
    setShowSuccessAlert(false);
  }, []);

  useEffect(() => {
    if (searchParams.get("showAlert") === "true") {
      setShowSuccessAlert(true);
      const newUrl = `/roulettes/${roulette?.hash}`;
      const fullUrl = `${window.location.origin}${newUrl}`;
      setSavedUrl(fullUrl);
      router.replace(newUrl);
    }
  }, [searchParams, roulette?.hash, router]);

  const wheelData = useMemo(
    () =>
      participants.map((p) => ({
        option: `${p.participantName} ${p.emoji}`,
        style: p.isHit ? { backgroundColor: "gray", textColor: "white" } : {},
      })),
    [participants],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        toggleEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker, toggleEmojiPicker]);

  const retryWinner = useCallback(() => {
    if (winner) {
      setParticipants((prev) =>
        prev.map((p) => (p.uuid === winner.uuid ? { ...p, isHit: false } : p)),
      );
      spinRoulette();
    }
  }, [winner, spinRoulette]);

  return {
    participants,
    newParticipantName,
    showEmojiPicker,
    selectedParticipant,
    isSpinning,
    winner,
    prizeNumber,
    editingParticipant,
    editName,
    emojiPickerPosition,
    emojiPickerRef,
    updateNewParticipantName,
    addParticipant,
    removeParticipant,
    handleEmojiClick,
    toggleParticipantHit,
    handleChangeEditName,
    handleEditClick,
    handleEditSubmit,
    handleEmojiButtonClick,
    spinRoulette,
    resetSelection,
    selectWinner,
    wheelData,
    saveState,
    showSuccessAlert,
    savedUrl,
    closeSuccessAlert,
    retryWinner,
  };
}
