export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  answers: string[];
}

export type GetTriviaOptions = {
  amount: number;
  difficulty: string;
};

export function decodeHtml(html: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
  };
  return html
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/(&amp;|&lt;|&gt;|&quot;|&#039;)/g, (m) => map[m] || m);
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getTriviaQuestions({
  amount,
  difficulty,
}: GetTriviaOptions): Promise<Question[]> {
  const params = new URLSearchParams({ amount: String(amount), difficulty });
  const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch trivia questions');
  const data: {
    response_code: number;
    results: Array<{
      category: string;
      type: string;
      difficulty: string;
      question: string;
      correct_answer: string;
      incorrect_answers: string[];
    }>;
  } = await res.json();

  if (data.response_code !== 0) {
    throw new Error('Open Trivia DB returned an error');
  }
  return data.results.map((q) => {
    const questionText = decodeHtml(q.question);
    const correct = decodeHtml(q.correct_answer);
    const incorrect = q.incorrect_answers.map(decodeHtml);
    const answers = shuffleArray([correct, ...incorrect]);

    return {
      category: q.category,
      type: q.type,
      difficulty: q.difficulty,
      question: questionText,
      correctAnswer: correct,
      incorrectAnswers: incorrect,
      answers,
    } as Question;
  });
}
