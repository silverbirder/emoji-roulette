"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import { useRoulettePresenter } from "./roulette.presenter";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  {
    ssr: false,
  },
);

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  {
    ssr: false,
  },
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
    updateNewParticipantName,
    toggleEmojiPicker,
    selectParticipantForEmoji,
    addParticipant,
    removeParticipant,
    handleEmojiClick,
    toggleParticipantHit,
    spinRoulette,
    resetSelection,
    selectWinner,
    wheelData,
    saveState,
  } = useRoulettePresenter({ roulette });

  const winnerStyle = "bg-yellow-400 text-yellow-900 font-semibold";

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Emoji Roulette
        </CardTitle>
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
          {participants.map((participant, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded p-2 ${
                participant.isHit ? "bg-gray-300 text-gray-600" : "bg-muted"
              }`}
            >
              <span>
                {participant.participantName} {participant.emoji}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleEmojiPicker(true);
                    selectParticipantForEmoji(participant);
                  }}
                >
                  Change Emoji
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(participant)}
                >
                  Remove
                </Button>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`hit-toggle-${index}`}
                    checked={participant.isHit}
                    onCheckedChange={() => toggleParticipantHit(participant)}
                  />
                  <label
                    htmlFor={`hit-toggle-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hit
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showEmojiPicker && selectedParticipant && (
          <div className="absolute z-10">
            <EmojiPicker
              onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject)}
            />
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
        <div className="space-y-2 text-center">
          <Button
            onClick={spinRoulette}
            disabled={isSpinning || participants.length <= 1}
            className="w-full"
          >
            {isSpinning ? "Spinning..." : "Spin the Roulette"}
          </Button>
          <Button onClick={resetSelection} variant="outline" className="w-full">
            Reset Selection
          </Button>
          <Button onClick={saveState} variant="secondary" className="w-full">
            Save State
          </Button>
        </div>
        {winner && (
          <div className={`${winnerStyle} rounded-lg p-4 text-center`}>
            <span className="text-xl font-bold">
              Winner of the Roulette: {winner.participantName} {winner.emoji}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
