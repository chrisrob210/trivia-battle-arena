'use client';

import { useEffect, useState } from 'react';
import { getTriviaQuestions, Question } from '@/lib/trivia';

interface HealthBarProps {
  hp: number;
  label: string;
}

function HealthBar({ hp, label }: HealthBarProps) {
  return (
    <div className="mb-2 w-full">
      <div className="text-sm mb-1">{label}: {hp}</div>
      <div className="h-4 w-full bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${hp}%` }}
        />
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" dangerouslySetInnerHTML={{ __html: question.question }} />
      <div className="grid gap-2">
        {question.answers.map((answer) => (
          <button
            key={answer}
            className="px-4 py-2 rounded border bg-blue-600 text-white disabled:opacity-50"
            onClick={() => onAnswer(answer)}
            disabled={disabled}
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PvPPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [player1HP, setPlayer1HP] = useState(100);
  const [player2HP, setPlayer2HP] = useState(100);
  const [player1Answers, setPlayer1Answers] = useState<string[]>([]);
  const [player2Answers, setPlayer2Answers] = useState<string[]>([]);
  const [p1Current, setP1Current] = useState<string | null>(null);
  const [p2Current, setP2Current] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    getTriviaQuestions({ amount: 5, difficulty: 'easy' })
      .then((qs) => setQuestions(qs))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (player1HP <= 0) setWinner('Player 2');
    else if (player2HP <= 0) setWinner('Player 1');
    else if (index >= questions.length && questions.length > 0) {
      if (player1HP === player2HP) setWinner('Draw');
      else setWinner(player1HP > player2HP ? 'Player 1' : 'Player 2');
    }
  }, [player1HP, player2HP, index, questions.length]);

  useEffect(() => {
    if (p1Current && p2Current && !locked) {
      setLocked(true);
      const correct = questions[index].correctAnswer;
      let p1HP = player1HP;
      let p2HP = player2HP;
      if (p1Current === correct) p2HP = Math.max(p2HP - 20, 0);
      else p1HP = Math.max(p1HP - 20, 0);
      if (p2Current === correct) p1HP = Math.max(p1HP - 20, 0);
      else p2HP = Math.max(p2HP - 20, 0);
      setPlayer1HP(p1HP);
      setPlayer2HP(p2HP);
      setPlayer1Answers((a) => [...a, p1Current]);
      setPlayer2Answers((a) => [...a, p2Current]);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setP1Current(null);
        setP2Current(null);
        setLocked(false);
      }, 500);
    }
  }, [p1Current, p2Current, locked, player1HP, player2HP, index, questions]);

  const current = questions[index];

  if (loading) {
    return <div className="p-4">Loading questions...</div>;
  }

  if (winner) {
    return (
      <div className="p-4 flex flex-col items-center gap-4">
        <HealthBar hp={player1HP} label="Player 1 HP" />
        <HealthBar hp={player2HP} label="Player 2 HP" />
        <h2 className="text-2xl font-bold">{winner} Wins!</h2>
      </div>
    );
  }

  if (!current) return null;

  function handleP1(ans: string) {
    if (!p1Current && !winner && !locked) {
      setP1Current(ans);
    }
  }

  function handleP2(ans: string) {
    if (!p2Current && !winner && !locked) {
      setP2Current(ans);
    }
  }

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <HealthBar hp={player1HP} label="Player 1 HP" />
      <HealthBar hp={player2HP} label="Player 2 HP" />
      <div className="flex justify-between text-sm">
        <span>Player 1 Answers: {player1Answers.length}</span>
        <span>Player 2 Answers: {player2Answers.length}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <QuestionCard question={current} onAnswer={handleP1} disabled={locked || !!p1Current} />
        <QuestionCard question={current} onAnswer={handleP2} disabled={locked || !!p2Current} />
      </div>
    </div>
  );
}

