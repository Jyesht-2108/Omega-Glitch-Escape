# Project OMEGA - Virtual Escape Room

A cyberpunk-themed, real-time competitive escape room platform where teams race against time to stop a rogue AI.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **State**: React Context + TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components (levels, login, etc.)
│   ├── lib/            # Utility functions
│   └── App.tsx         # Main app component
├── public/             # Static assets
└── docs/               # Project documentation
```

## Features Implemented

- ✅ Login system with team authentication
- ✅ 4 puzzle levels with progressive difficulty
- ✅ Real-time countdown timer (3 hours)
- ✅ Hint system with time penalty (-5 minutes)
- ✅ Score tracking
- ✅ Leaderboard ticker
- ✅ Cyberpunk UI with CRT effects
- ✅ Anti-cheat detection (tab switching, fullscreen)
- ✅ Victory screen
- ✅ Hidden routes (level3-admin)

## Next Steps

Backend implementation as per `docs/prd.md`:
- Go REST API + WebSocket server
- PostgreSQL database
- Redis for caching and pub/sub
- JWT authentication
- Admin portal
- Real-time leaderboard
- Anti-cheat logging
