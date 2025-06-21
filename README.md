# Nephew Stories

An interactive storytelling app for kids that creates personalized stories based on their favorite books. Built with Next.js 14, TypeScript, and OpenAI.

## Features

- **Personalized Stories**: Generated based on the child's favorite books and what they love about them
- **Interactive Choices**: 2-3 meaningful choice points that affect the story outcome
- **Beautiful Typography**: Optimized for 8-year-old readers with a premium book-like experience
- **Single Page App**: Everything happens on one page - no navigation needed
- **Responsive Design**: Works great on tablets and desktops
- **Age-Appropriate**: Safe, educational, and inspiring content for young readers

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nephew-stories
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
npm start
```

## Deployment

This app is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` environment variable in Vercel
4. Deploy!

## User Flow

1. **Welcome Screen**: Child enters their favorite books
2. **Preferences**: Child explains what they love about those books
3. **Story Generation**: AI creates a personalized story
4. **Interactive Reading**: Child reads and makes choices that affect the story
5. **Conclusion**: Story reaches a satisfying ending

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom typography
- **AI**: OpenAI GPT-4o-mini for story generation
- **State Management**: React useState (no external libraries)

## Project Structure

```
src/
├── app/
│   ├── api/generate-story/
│   │   └── route.ts          # OpenAI API integration
│   ├── globals.css           # Global styles and components
│   ├── layout.tsx            # App layout
│   └── page.tsx              # Main storytelling component
├── components/               # Reusable components (future use)
└── types/
    └── index.ts             # TypeScript type definitions
```

## Design Principles

- **One Interface**: Everything happens on the main page
- **Immersive Experience**: Like a premium digital book
- **Natural Choices**: Story choices feel organic, not intrusive
- **Clean UI**: Interface gets out of the way of the story
- **Accessibility**: Optimized for young readers

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
