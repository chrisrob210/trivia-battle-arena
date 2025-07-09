"use client";

import { useEffect, useState } from 'react';
import {
    getTriviaQuestions,
    getTriviaCategories,
    Question,
    TriviaCategory,
} from '@/lib/trivia';

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
    correctAnswer: string | null;
}

function QuestionCard({ question, onAnswer, disabled, correctAnswer }: QuestionCardProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: question.question }} />
            <div className={`${!correctAnswer ? `opacity-0` : `opacity-100`} ${correctAnswer ? 'text-red-500' : 'text-green-500'} font-semibold transition-opacity duration-500`}>{correctAnswer ? `Correct Answer: ${correctAnswer}` : 'Correct Answer'}</div>
            <div className='grid gap-2  transition-opacity duration-700'>
                {question.answers.map((answer) => (
                    <button
                        key={answer}
                        className="px-4 py-2 rounded-lg bg-blue-700 text-white disabled:opacity-50 hover:bg-blue-600 transition-all duration-300"
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
    const [triviaCategory, setTriviaCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<TriviaCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [changeCategoryDisabled, setChangeCategoryDisabled] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)

    let hasFetched = false;

    useEffect(() => {
        getTriviaCategories().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        if (hasFetched) return; //prevents double loading in dev mode
        hasFetched = true;  //
        if (triviaCategory) {
            getTriviaQuestions({ amount: 5, difficulty: 'easy', category: triviaCategory })
                .then((qs) => { if (qs) setQuestions(qs) })
                .finally(() => setLoading(false))
        }
    }, [triviaCategory]);

    useEffect(() => {
        if (playerHP <= 0) setWinner('AI');
        else if (aiHP <= 0) setWinner('Player');
        else if (index >= questions.length && questions.length > 0) {
            setLoading(true);
            getTriviaQuestions({ amount: 5, difficulty: 'easy', category: triviaCategory! })
                .then((qs) => setQuestions((prev) => [...prev, ...qs]))
                .finally(() => setLoading(false));
        }
    }, [playerHP, aiHP, index, questions.length]);

    useEffect(() => {
        if (questions.length > 0) {
            setChangeCategoryDisabled(true);
            const timer = setTimeout(() => setChangeCategoryDisabled(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [questions]);

    function handleAnswer(answer: string) {
        if (answerLocked || winner) return;
        if (!questions[index]) return;
        const correct = answer === questions[index].correctAnswer;
        setAnswerLocked(true);
        if (correct) {
            setAiHP((hp) => Math.max(hp - 20, 0));
            setCorrectAnswer(null)
        } else {
            setPlayerHP((hp) => Math.max(hp - 20, 0));
            setCorrectAnswer(questions[index].correctAnswer)
        }
        setTimeout(() => {
            setIndex((i) => i + 1);
            setAnswerLocked(false);
        }, 500);
    }

    function handlePlayAgain() {
        setLoading(true);
        setPlayerHP(100);
        setAiHP(100);
        setIndex(0);
        setWinner(null);
        setTriviaCategory(null)
        setAnswerLocked(false);
        setCorrectAnswer(null)
        setSelectedCategory(null)
        // getTriviaQuestions({ amount: 5, difficulty: 'easy', category: triviaCategory! })
        //     .then((qs) => setQuestions(qs))
        //     .finally(() => setLoading(false));
    }

    function handleChangeCategory() {
        setTriviaCategory(null)
        setSelectedCategory(null)
    }

    if (loading && triviaCategory) {
        return <div className="p-4 flex flex-col items-center">Loading questions...</div>;
    }

    if (!triviaCategory && categories.length > 0) {
        return (
            <div className="p-4 flex flex-col items-center gap-4">
                <div className="font-semibold">Select Trivia Category:</div>
                <div className="flex gap-1">
                    <select
                        className="p-2 border rounded-lg"
                        // value={selectedCategory ?? categories.length > 0 ? categories[0].id : ''}
                        onChange={(e) => setSelectedCategory(Number(e.target.value))}
                        defaultValue={categories[0].id}
                    >

                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors duration-500"
                        onClick={() => selectedCategory ? setTriviaCategory(selectedCategory) : setTriviaCategory(9)}
                    >
                        Select
                    </button>
                </div>
            </div>
        );
    }

    if (winner) {
        return (
            <div className="p-4 flex flex-col items-center gap-4">
                <HealthBar hp={playerHP} label="Player HP" />
                <HealthBar hp={aiHP} label="AI HP" />
                <h2 className="text-2xl font-bold">{winner} Wins!</h2>
                <button
                    className="px-4 py-2 rounded border bg-blue-600 text-white"
                    onClick={handlePlayAgain}
                >
                    Play Again
                </button>
            </div>
        );
    }

    const current = questions[index];
    if (!current) return null;

    return (
        <div className="p-4 space-y-6 max-w-xl mx-auto">
            <HealthBar hp={playerHP} label="Player HP" />
            <HealthBar hp={aiHP} label="AI HP" />
            <QuestionCard question={current} onAnswer={handleAnswer} disabled={answerLocked} correctAnswer={correctAnswer} />
            <div className="flex flex-row justify-center gap-4">
                <button
                    className={`${changeCategoryDisabled ? `text-slate-300 bg-stone-600` : `text-white bg-yellow-600`} ${!changeCategoryDisabled && `hover:bg-yellow-500 transition-colors duration-300`} px-2 py-1 rounded-lg text-sm disabled:opacity-50`}
                    onClick={handleChangeCategory}
                    disabled={changeCategoryDisabled}
                >
                    {changeCategoryDisabled ? 'Wait to Change' : 'Change Category'}
                </button>
                <button className="text-white bg-green-600 hover:bg-green-500 transition-colors duration-300 px-2 py-1 rounded-lg text-sm" onClick={() => handlePlayAgain()}>New Game</button>
            </div>
        </div>
    );
}

export default AiGame;
