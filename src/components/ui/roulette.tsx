"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F06292",
  "#AED581",
  "#7986CB",
  "#4DB6AC",
  "#9575CD",
  "#4DD0E1",
  "#81C784",
];

const defaultEmojis = [
  "🎉",
  "🎊",
  "🥳",
  "🎈",
  "🎇",
  "🎆",
  "✨",
  "💫",
  "🌟",
  "⭐",
  "🍾",
  "🥂",
];

interface Participant {
  name: string;
  emoji: string;
}

export default function Roulette() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmoji, setNewParticipantEmoji] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Participant | null | undefined>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [isStopRequested, setIsStopRequested] = useState(false); // Added state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emojiConfettiRef = useRef<any[]>([]);

  useEffect(() => {
    audioRef.current = new Audio("/spinning-sound.mp3");
  }, []);

  const addParticipant = () => {
    if (
      newParticipantName &&
      newParticipantEmoji &&
      !participants.some((p) => p.name === newParticipantName)
    ) {
      setParticipants([
        ...participants,
        { name: newParticipantName, emoji: newParticipantEmoji },
      ]);
      setNewParticipantName("");
      setNewParticipantEmoji("");
    }
  };

  const removeParticipant = (participant: Participant) => {
    setParticipants(participants.filter((p) => p.name !== participant.name));
    setSelectedParticipants(
      selectedParticipants.filter((p) => p.name !== participant.name),
    );
  };

  const spinRoulette = () => {
    if (participants.length > 1 && !isSpinning) {
      setIsSpinning(true);
      setIsStopRequested(false); // Added line
      setWinner(null);

      const minSpins = 3;
      const maxSpins = 8;
      const spins = minSpins + Math.random() * (maxSpins - minSpins);
      const stopAngle = Math.random() * 360;
      const totalRotation = spins * 360 + stopAngle;

      const minDuration = 4000;
      const maxDuration = 8000;
      const duration =
        minDuration + Math.random() * (maxDuration - minDuration);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }

      let start: number | null = null;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        const easeProgress = easeInOutCubic(progress);

        if (progress < 1 && !isStopRequested) {
          // Modified condition
          setRotation(easeProgress * totalRotation);
          requestAnimationFrame(animate);
        } else {
          setRotation(totalRotation % 360);
          setIsSpinning(false);
          const winnerIndex = Math.floor(
            ((360 - (rotation % 360)) / 360) * participants.length,
          ); // Modified to use current rotation
          const newWinner = participants[winnerIndex];
          setWinner(newWinner);
          newWinner &&
            setSelectedParticipants([...selectedParticipants, newWinner]);
          setParticipants(
            participants.filter((p) => p.name !== newWinner?.name),
          );
          if (audioRef.current) {
            audioRef.current.pause();
          }
          startPersonalizedEmojiConfetti(newWinner?.emoji ?? "");
        }
      };

      requestAnimationFrame(animate);
    }
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const resetSelection = () => {
    setParticipants([...participants, ...selectedParticipants]);
    setSelectedParticipants([]);
  };

  const startPersonalizedEmojiConfetti = (emoji: string) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        emojiConfettiRef.current = [];

        const direction = Math.floor(Math.random() * 4); // 0: bottom to top, 1: top to bottom, 2: left to right, 3: right to left

        for (let i = 0; i < 100; i++) {
          let x, y, xSpeed, ySpeed;
          switch (direction) {
            case 0: // bottom to top
              x = Math.random() * canvas.width;
              y = canvas.height + 50;
              xSpeed = 0;
              ySpeed = -(Math.random() * 3 + 2);
              break;
            case 1: // top to bottom
              x = Math.random() * canvas.width;
              y = -50;
              xSpeed = 0;
              ySpeed = Math.random() * 3 + 2;
              break;
            case 2: // left to right
              x = -50;
              y = Math.random() * canvas.height;
              xSpeed = Math.random() * 3 + 2;
              ySpeed = 0;
              break;
            case 3: // right to left
              x = canvas.width + 50;
              y = Math.random() * canvas.height;
              xSpeed = -(Math.random() * 3 + 2);
              ySpeed = 0;
              break;
          }

          emojiConfettiRef.current.push({
            x,
            y,
            size: Math.random() * 20 + 10,
            emoji: emoji,
            xSpeed,
            ySpeed,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
          });
        }

        const animateEmojiConfetti = () => {
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let stillAnimating = false;

            emojiConfettiRef.current.forEach((confetti, index) => {
              confetti.x += confetti.xSpeed;
              confetti.y += confetti.ySpeed;
              confetti.rotation += confetti.rotationSpeed;

              if (
                (direction === 0 && confetti.y > -50) ||
                (direction === 1 && confetti.y < canvas.height + 50) ||
                (direction === 2 && confetti.x < canvas.width + 50) ||
                (direction === 3 && confetti.x > -50)
              ) {
                stillAnimating = true;
              }

              ctx.save();
              ctx.translate(confetti.x, confetti.y);
              ctx.rotate((confetti.rotation * Math.PI) / 180);
              ctx.font = `${confetti.size}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(confetti.emoji, 0, 0);
              ctx.restore();
            });

            if (stillAnimating) {
              requestAnimationFrame(animateEmojiConfetti);
            } else {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        };

        animateEmojiConfetti();

        // 祝福の音を再生
        const celebrationSound = new Audio("/celebration-sound.mp3");
        celebrationSound.play();
      }
    }
  };

  const stopRoulette = () => {
    // Added function
    setIsStopRequested(true);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          朝会担当ルーレット
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="参加者名"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addParticipant()}
          />
          <Input
            type="text"
            placeholder="絵文字"
            value={newParticipantEmoji}
            onChange={(e) => setNewParticipantEmoji(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addParticipant()}
          />
          <Button onClick={addParticipant}>追加</Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeParticipant(participant)}
              >
                削除
              </Button>
            </div>
          ))}
        </div>
        <div className="relative mx-auto h-64 w-64">
          {participants.length > 1 ? (
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="#f0f0f0"
                stroke="#333"
                strokeWidth="0.5"
              />
              <g transform={`rotate(${rotation} 50 50)`}>
                {participants.map((participant, index) => {
                  const angle = (index / participants.length) * 360;
                  const nextAngle = ((index + 1) / participants.length) * 360;
                  const midAngle = (angle + nextAngle) / 2;
                  const colorIndex = index % colors.length;
                  const isSelected = selectedParticipants.some(
                    (p) => p.name === participant.name,
                  );
                  return (
                    <g key={index}>
                      <path
                        d={`M 50 50 L ${50 + 48 * Math.cos((angle * Math.PI) / 180)} ${
                          50 + 48 * Math.sin((angle * Math.PI) / 180)
                        } A 48 48 0 0 1 ${50 + 48 * Math.cos((nextAngle * Math.PI) / 180)} ${
                          50 + 48 * Math.sin((nextAngle * Math.PI) / 180)
                        } Z`}
                        fill={isSelected ? "#cccccc" : colors[colorIndex]}
                        stroke="#333"
                        strokeWidth="0.5"
                      />
                      <text
                        x={50 + 30 * Math.cos((midAngle * Math.PI) / 180)}
                        y={50 + 30 * Math.sin((midAngle * Math.PI) / 180)}
                        fontSize="4"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isSelected ? "#666666" : "#333333"}
                        transform={`rotate(${midAngle} ${50 + 30 * Math.cos((midAngle * Math.PI) / 180)} ${
                          50 + 30 * Math.sin((midAngle * Math.PI) / 180)
                        })`}
                        className="select-none"
                      >
                        {participant.name} {participant.emoji}
                      </text>
                    </g>
                  );
                })}
              </g>
              <polygon points="50,0 48,5 52,5" fill="red" />
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-lg font-semibold">
                {participants.length === 0
                  ? "全員選択されました。リセットしてください。"
                  : "参加者が1人しかいません。"}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2 text-center">
          <Button
            onClick={spinRoulette}
            disabled={isSpinning || participants.length <= 1}
            className="w-full"
          >
            {isSpinning ? "スピン中..." : "ルーレットを回す"}
          </Button>
          {isSpinning && ( // Added conditional rendering
            <Button
              onClick={stopRoulette}
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              ルーレットを停止
            </Button>
          )}
          <Button onClick={resetSelection} variant="outline" className="w-full">
            選択をリセット
          </Button>
        </div>
        {winner && (
          <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
            <span className="text-xl font-bold">
              明日の朝会担当: {winner.name} {winner.emoji}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-muted-foreground text-center text-sm">
        明日の朝会担当者を決めよう！
      </CardFooter>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
    </Card>
  );
}
