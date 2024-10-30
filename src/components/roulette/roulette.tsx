"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useRoulettePresenter } from "./roulette.presenter";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  {
    ssr: false,
  }
);

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  {
    ssr: false,
  }
);

export const Roulette = () => {
  const {
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
  } = useRoulettePresenter();

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
            onChange={(e) => setNewParticipantName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addParticipant()}
          />
          <Button onClick={addParticipant}>Add</Button>
        </div>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="bg-muted flex items-center justify-between rounded p-2"
            >
              <span>
                {participant.name} {participant.emoji}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(true)}
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
              </div>
            </div>
          ))}
        </div>
        {showEmojiPicker && (
          <div className="absolute z-10">
            <EmojiPicker
            // onEmojiClick={(emojiObject) =>
            //   // handleEmojiClick(emojiObject, part)
            // }
            />
          </div>
        )}
        <div className="relative mx-auto h-64 w-64">
          {participants.length > 1 && (
            <Wheel
              mustStartSpinning={isSpinning}
              prizeNumber={0}
              data={wheelData}
              onStopSpinning={() => {
                setIsSpinning(false);
              }}
              backgroundColors={[
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#FFA07A",
                "#98D8C8",
                "#F06292",
              ]}
              textColors={["#ffffff"]}
              fontSize={14}
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
        </div>
        {winner && (
          <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
            <span className="text-xl font-bold">
              Winner of the Roulette: {winner.name} {winner.emoji}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
