# agent.md

## Tech Stack
- Use Next.js with the App Router
- Use Tailwind CSS for styling
- Use TypeScript
- Do not use Redux or context unless absolutely necessary
- Prefer functional components and React hooks

## App Purpose
This is a trivia battle game called "Trivia Battle Arena". It uses the Open Trivia DB API to get trivia questions.

There are two main game modes:
- Player vs AI
- Player vs Player (local)

The player selects difficulty and number of questions. Each player answers questions turn by turn or simultaneously (depending on mode). Each correct answer deals "damage" to the other player or increases the score.

## Behavior Notes
- Health bar system: each player starts with 100 HP
- Correct answers reduce opponent’s HP
- Track current question index, score, and streaks
- Animate health changes if possible
- Use local state (e.g. useState, useEffect) or Zustand if needed

## Styling
- Make it mobile-friendly by default
- Use a fun theme (e.g., retro pixel UI or card game style)

## File Naming
- Use kebab-case or camelCase for files
- Pages go under `/app` directory (App Router)
- Trivia logic can go in `/lib/trivia.ts`

## API Usage
- Use https://opentdb.com/api.php
- Decode HTML entities in question/answer text
- Shuffle answer choices client-side
