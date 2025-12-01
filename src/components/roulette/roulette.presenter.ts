import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSConfetti from "js-confetti";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export interface Participant {
  id?: number;
  uuid: string;
  participantName: string;
  emoji: string;
  isHit: boolean;
  position?: number;
}

type Props = {
  roulette?: {
    id: number;
    hash: string;
    autoSaveEnabled: boolean;
    participants: {
      id: number;
      participantName: string;
      emoji: string;
      isHit: boolean | null;
      position?: number | null;
      rouletteId: number;
    }[];
  } | null;
};

export function useRoulettePresenter({ roulette }: Props) {
  const serializeParticipants = useCallback(
    (list: Participant[]) =>
      JSON.stringify(
        list.map((p) => ({
          id: p.id,
          participantName: p.participantName,
          emoji: p.emoji,
          isHit: p.isHit,
        })),
      ),
    [],
  );

  const initialParticipants: Participant[] =
    roulette?.participants.map((participant) => ({
      id: participant.id,
      uuid: uuidv4(),
      participantName: participant.participantName,
      emoji: participant.emoji,
      isHit: !!participant.isHit,
      position: participant.position ?? 0,
    })) ?? [];

  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants,
  );
  const [currentHash, setCurrentHash] = useState<string | undefined>(
    roulette?.hash,
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    roulette?.autoSaveEnabled ?? false,
  );

  const participantsSnapshotRef = useRef<string>(
    serializeParticipants(initialParticipants),
  );

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
          position: prev.length,
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
  });

  const saveState = useCallback(
    async ({
      showAlert = true,
      reason,
      autoSaveEnabledOverride,
      notify = true,
    }: {
      showAlert?: boolean;
      reason?: string;
      autoSaveEnabledOverride?: boolean;
      notify?: boolean;
    } = {}) => {
      try {
        const result = await saveRoulette.mutateAsync({
          hash: currentHash,
          autoSaveEnabled: autoSaveEnabledOverride ?? autoSaveEnabled,
      participants: participants.map((participant, index) => ({
        id: participant.id,
        participantName: participant.participantName,
        emoji: participant.emoji,
        isHit: participant.isHit,
        position: index,
      })),
        });

        setCurrentHash(result.hash);

        if (showAlert) {
          const newUrl = `/roulettes/${result.hash}?showAlert=true`;
          router.push(newUrl);
        } else if (!currentHash) {
          const newUrl = `/roulettes/${result.hash}`;
          router.replace(newUrl);
        }

        if (!showAlert && notify) {
          toast({
            title: "Auto-saved",
            description: reason ?? "Latest changes saved.",
          });
        }

        participantsSnapshotRef.current = serializeParticipants(participants);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An error occurred while saving.";
        toast({
          title: "Save failed",
          description: message,
          variant: "destructive",
        });
      }
    },
    [
      autoSaveEnabled,
      currentHash,
      participants,
      router,
      saveRoulette,
      serializeParticipants,
    ],
  );

  const requestAutoSave = useCallback(
    ({ reason, silent }: { reason?: string; silent?: boolean } = {}) => {
      if (!autoSaveEnabled) return;
      void saveState({ showAlert: false, reason, notify: !silent });
    },
    [autoSaveEnabled, saveState],
  );

  const moveParticipant = useCallback(
    (uuid: string, direction: "up" | "down") => {
      setParticipants((prev) => {
        const index = prev.findIndex((p) => p.uuid === uuid);
        if (index === -1) return prev;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        const newList = [...prev];
        const [removed] = newList.splice(index, 1);
        if (!removed) return prev;
        newList.splice(targetIndex, 0, removed);
        return newList.map((p, idx) => ({ ...p, position: idx }));
      });
      requestAutoSave({ silent: true });
    },
    [requestAutoSave],
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
      requestAutoSave({ silent: true });
    }
  }, [participants, isSpinning, requestAutoSave]);

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

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const serializedParticipants = serializeParticipants(participants);
    if (serializedParticipants === participantsSnapshotRef.current) return;

    participantsSnapshotRef.current = serializedParticipants;
    requestAutoSave({ reason: "Changes auto-saved." });
  }, [participants, autoSaveEnabled, requestAutoSave, serializeParticipants]);

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

  const toggleAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    participantsSnapshotRef.current = serializeParticipants(participants);
    void saveState({
      showAlert: false,
      reason: enabled
        ? "Auto-save turned on."
        : "Auto-save turned off.",
      autoSaveEnabledOverride: enabled,
    });
  }, [participants, saveState, serializeParticipants]);

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
    autoSaveEnabled,
    updateNewParticipantName,
    addParticipant,
    removeParticipant,
    handleEmojiClick,
    toggleParticipantHit,
    handleChangeEditName,
    handleEditClick,
    handleEditSubmit,
    handleEmojiButtonClick,
    moveParticipant,
    spinRoulette,
    resetSelection,
    selectWinner,
    wheelData,
    saveState,
    showSuccessAlert,
    savedUrl,
    closeSuccessAlert,
    retryWinner,
    toggleAutoSave,
    requestAutoSave,
  };
}
