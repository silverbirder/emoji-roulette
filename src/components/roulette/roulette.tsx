"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import { useRoulettePresenter } from "./roulette.presenter";
import { Pencil, Trash2, RotateCcw, Save, Trophy, Zap } from "lucide-react";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false },
);

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false },
);

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

export const Roulette = ({ roulette }: Props) => {
  const {
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
    handleEditClick,
    handleEditSubmit,
    handleEmojiButtonClick,
    handleChangeEditName,
    spinRoulette,
    resetSelection,
    selectWinner,
    wheelData,
    saveState,
  } = useRoulettePresenter({ roulette });

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Emoji Roulette</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={resetSelection}
            title="Reset Selection"
            className="text-yellow-600 hover:text-yellow-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={saveState}
            title="Save State"
            className="text-green-600 hover:text-green-700"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Participant Name"
            value={newParticipantName}
            onChange={(e) => updateNewParticipantName(e.target.value)}
          />
          <Button onClick={addParticipant}>Add</Button>
        </div>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.uuid}
              className={`flex items-center justify-between rounded p-2 ${
                participant.isHit ? "bg-gray-300 text-gray-600" : "bg-muted"
              }`}
            >
              {editingParticipant === participant.uuid ? (
                <div className="flex flex-grow items-center space-x-2">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => handleChangeEditName(e.target.value)}
                    className="flex-grow"
                    placeholder="Name"
                  />
                  <Button
                    onClick={() => handleEditSubmit(participant.uuid)}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex flex-grow items-center space-x-2">
                  <button
                    className="text-2xl"
                    onClick={(e) => handleEmojiButtonClick(participant, e)}
                  >
                    {participant.emoji}
                  </button>
                  <span>{participant.participantName}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleEditClick(
                      participant.uuid,
                      participant.participantName,
                    )
                  }
                  aria-label={`Edit ${participant.participantName}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Switch
                  id={`hit-toggle-${participant.uuid}`}
                  checked={participant.isHit}
                  onCheckedChange={() => toggleParticipantHit(participant.uuid)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(participant.uuid)}
                  aria-label={`Remove ${participant.participantName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {showEmojiPicker && selectedParticipant && emojiPickerPosition && (
          <div
            ref={emojiPickerRef}
            className="absolute z-20 w-80 md:w-96"
            style={{
              top: emojiPickerPosition?.top,
              left: emojiPickerPosition?.left,
            }}
          >
            <EmojiPicker
              onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject)}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
              width="100%"
              className="relative"
            />
          </div>
        )}
        <div className="relative">
          {winner && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="animate-fade-in rounded-lg bg-gradient-to-r from-yellow-400/90 to-orange-500/90 p-6 text-center shadow-lg backdrop-blur-sm">
                <Trophy className="mx-auto mb-2 h-12 w-12 text-white" />
                <h2 className="mb-2 text-2xl font-bold text-white">Winner!</h2>
                <div className="text-3xl font-extrabold text-white">
                  {winner.emoji} {winner.participantName} {winner.emoji}
                </div>
              </div>
            </div>
          )}
          <div className="item-center flex justify-center">
            {participants.length > 1 && (
              <Wheel
                mustStartSpinning={isSpinning}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={selectWinner}
                backgroundColors={[
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#FFA07A",
                  "#98D8C8",
                  "#F06292",
                ]}
                textColors={["#ffffff"]}
                spinDuration={0.2}
              />
            )}
          </div>
        </div>
        <div className="text-center">
          <Button
            onClick={spinRoulette}
            disabled={isSpinning || participants.length <= 1}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            {isSpinning ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Spin the Roulette
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
