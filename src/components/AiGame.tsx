"use client";

import { useEffect, useState } from 'react';
import { getTriviaQuestions, Question } from '../lib/trivia';

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

export function AiGame() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [index, setIndex] = useState(0);
    const [playerHP, setPlayerHP] = useState(100);
    const [aiHP, setAiHP] = useState(100);
    const [loading, setLoading] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [answerLocked, setAnswerLocked] = useState(false);

    useEffect(() => {
        getTriviaQuestions({ amount: 5, difficulty: 'easy' })
            .then((qs) => setQuestions(qs))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (playerHP <= 0) setWinner('AI');
        else if (aiHP <= 0) setWinner('Player');
        else if (index >= questions.length && questions.length > 0) {
            if (playerHP === aiHP) setWinner('Draw');
            else setWinner(playerHP > aiHP ? 'Player' : 'AI');
        }
    }, [playerHP, aiHP, index, questions.length]);

    function handleAnswer(answer: string) {
        if (answerLocked || winner) return;
        if (!questions[index]) return;
        const correct = answer === questions[index].correctAnswer;
        setAnswerLocked(true);
        if (correct) {
            setAiHP((hp) => Math.max(hp - 20, 0));
        } else {
            setPlayerHP((hp) => Math.max(hp - 20, 0));
        }
        setTimeout(() => {
            setIndex((i) => i + 1);
            setAnswerLocked(false);
        }, 500);
    }

    if (loading) {
        return <div className="p-4">Loading questions...</div>;
    }

    if (winner) {
        return (
            <div className="p-4 flex flex-col items-center gap-4">
                <HealthBar hp={playerHP} label="Player HP" />
                <HealthBar hp={aiHP} label="AI HP" />
                <h2 className="text-2xl font-bold">{winner} Wins!</h2>
            </div>
        );
    }

    const current = questions[index];
    if (!current) return null;

    return (
        <div className="p-4 space-y-6 max-w-xl mx-auto">
            <HealthBar hp={playerHP} label="Player HP" />
            <HealthBar hp={aiHP} label="AI HP" />
            <QuestionCard question={current} onAnswer={handleAnswer} disabled={answerLocked} />
        </div>
    );
}

export default AiGame;
