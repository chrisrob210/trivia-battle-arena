# Trivia Battle Arena

Trivia Battle Arena is a browser based quiz where each correct answer damages your opponent. Questions are retrieved from the [Open Trivia DB](https://opentdb.com) API.

## Game Modes

- **Player vs AI** - fight against the computer.
- **Player vs Player** - two players share the same screen.

## Development Setup

Requirements:

- Node.js 18 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Customizing Questions

Both game modes fetch questions with `getTriviaQuestions` in their respective components/pages:

- `src/components/AiGame.tsx`
- `src/app/game/pvp/page.tsx`

Edit the `amount` and `difficulty` options to change how many questions are asked and at what difficulty.

```ts
getTriviaQuestions({ amount: 5, difficulty: 'easy' })
```

Valid difficulties are `easy`, `medium`, and `hard`.

## Using AiGame in Other Projects

The AI mode is available as a standalone React component located at
`src/components/AiGame.tsx`.

If this project is installed as a dependency you can import it like:

```ts
import { AiGame } from 'trivia-battle-arena';
```

Or reference the file directly with a relative path:

```ts
import { AiGame } from '../path/to/trivia-battle-arena/src/components/AiGame';
```


