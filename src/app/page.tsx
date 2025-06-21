'use client';

import { useState, useEffect } from 'react';
import type { AppState, UserPreferences, Story, StoryChoice, CompleteStory, StorySegment } from '@/types';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>({ step: 'welcome' });
  const [completeStory, setCompleteStory] = useState<CompleteStory | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [pageTransition, setPageTransition] = useState(false);

  const generateCompleteStory = async (preferences: UserPreferences) => {
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoriteBooks: preferences.favoriteBooks,
          whyLoveBooks: preferences.whyLoveBooks,
          generateComplete: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate story');
      }

      return data.story as CompleteStory;
    } catch (error) {
      throw error;
    }
  };

  const handleStartStory = async (preferences: UserPreferences) => {
    setAppState({ step: 'generating', preferences });

    try {
      const story = await generateCompleteStory(preferences);
      setCompleteStory(story);
      
      // Create initial story state
      const initialStory: Story = {
        id: story.id,
        title: story.title,
        premise: story.premise,
        characters: story.characters,
        theme: story.theme,
        segments: [story.segments[0]], // Start with first segment
        currentSegmentIndex: 0,
        userChoices: [],
        chosenPath: [],
      };

      setCurrentStory(initialStory);
      
      if (story.segments[0]?.choices?.length > 0) {
        setAppState({ 
          step: 'choice', 
          story: initialStory, 
          preferences,
          choices: story.segments[0].choices 
        });
      } else {
        setAppState({ step: 'reading', story: initialStory, preferences });
      }
    } catch (error) {
      setAppState({ 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Something went wrong',
        canRetry: true 
      });
    }
  };

  const handleChoice = async (choice: StoryChoice) => {
    if (appState.step !== 'choice' || !completeStory || !currentStory) return;

    // Trigger page turn animation
    setPageTransition(true);
    
    setTimeout(() => {
      const { story, preferences } = appState;
      const updatedChoices = [...story.userChoices, choice.text];
      const updatedPath = [...story.chosenPath, choice.leadTo];

      // Find the next segment based on the choice
      const nextSegment = completeStory.segments.find(s => s.id === choice.leadTo);
      
      if (!nextSegment) {
        setAppState({ 
          step: 'error', 
          error: 'Story path not found',
          canRetry: true 
        });
        return;
      }

      const updatedStory: Story = {
        ...story,
        segments: [...story.segments, nextSegment],
        currentSegmentIndex: story.currentSegmentIndex + 1,
        userChoices: updatedChoices,
        chosenPath: updatedPath,
      };

      setCurrentStory(updatedStory);

      if (nextSegment.isEnding || !nextSegment.choices?.length) {
        setAppState({ step: 'reading', story: updatedStory, preferences });
      } else {
        setAppState({ 
          step: 'choice', 
          story: updatedStory, 
          preferences,
          choices: nextSegment.choices 
        });
      }

      setPageTransition(false);
    }, 300);
  };

  const handleRestart = () => {
    setCompleteStory(null);
    setCurrentStory(null);
    setAppState({ step: 'welcome' });
  };

  const handleRetry = () => {
    if (appState.step === 'error' && appState.canRetry) {
      setAppState({ step: 'welcome' });
    }
  };

  // Generate background based on current story segment
  const getCurrentBackground = () => {
    if (!currentStory || currentStory.segments.length === 0) return '';
    const currentSegment = currentStory.segments[currentStory.currentSegmentIndex];
    return currentSegment?.backgroundScene || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* Dynamic Background */}
      {getCurrentBackground() && (
        <div 
          className="story-background"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(generateBackgroundSVG(getCurrentBackground()))}")`,
          }}
        />
      )}
      
      <div className="story-container">
        <div className={`story-page ${pageTransition ? 'page-turn-exit-active' : 'page-turn-enter-active'}`}>
          {appState.step === 'welcome' && (
            <WelcomeScreen onNext={(favoriteBooks) => 
              setAppState({ step: 'preferences', favoriteBooks })
            } />
          )}

          {appState.step === 'preferences' && (
            <PreferencesScreen 
              favoriteBooks={appState.favoriteBooks || ''}
              onBack={() => setAppState({ step: 'welcome' })}
              onNext={handleStartStory}
            />
          )}

          {appState.step === 'generating' && (
            <GeneratingScreen />
          )}

          {appState.step === 'reading' && (
            <ReadingScreen 
              story={appState.story}
              onRestart={handleRestart}
            />
          )}

          {appState.step === 'choice' && (
            <ChoiceScreen 
              story={appState.story}
              choices={appState.choices}
              onChoice={handleChoice}
              onRestart={handleRestart}
            />
          )}

          {appState.step === 'error' && (
            <ErrorScreen 
              error={appState.error}
              canRetry={appState.canRetry}
              onRetry={handleRetry}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Simple SVG background generator
function generateBackgroundSVG(description: string): string {
  // This is a simplified version - in production, you'd use a proper image generation API
  const colors = ['#fef3c7', '#fed7aa', '#fecaca', '#ddd6fe', '#bfdbfe'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `
    <svg width="100%" height="100%" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="200" cy="150" r="50" fill="${randomColor}" opacity="0.2"/>
      <circle cx="800" cy="200" r="30" fill="${randomColor}" opacity="0.15"/>
      <circle cx="1000" cy="600" r="80" fill="${randomColor}" opacity="0.1"/>
    </svg>
  `;
}

function WelcomeScreen({ onNext }: { onNext: (favoriteBooks: string) => void }) {
  const [favoriteBooks, setFavoriteBooks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (favoriteBooks.trim()) {
      onNext(favoriteBooks.trim());
    }
  };

  return (
    <div className="text-center animate-fadeIn">
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-800 mb-6 text-balance">
          Welcome to<br />
          <span className="text-amber-600">Nephew Stories</span>
        </h1>
        <p className="text-xl text-amber-700 max-w-2xl mx-auto text-balance">
          Let&apos;s create a magical adventure just for you! Tell me about the books that capture your imagination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="favoriteBooks" className="block text-lg font-medium text-amber-800 mb-3">
            What are some of your favorite books?
          </label>
          <textarea
            id="favoriteBooks"
            value={favoriteBooks}
            onChange={(e) => setFavoriteBooks(e.target.value)}
            placeholder="Tell me about the books you love... (e.g., Harry Potter, Where the Wild Things Are, Dog Man, etc.)"
            rows={4}
            className="input-field resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!favoriteBooks.trim()}
          className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue Your Journey →
        </button>
      </form>
    </div>
  );
}

function PreferencesScreen({ 
  favoriteBooks, 
  onBack, 
  onNext 
}: { 
  favoriteBooks: string;
  onBack: () => void;
  onNext: (preferences: UserPreferences) => void;
}) {
  const [whyLoveBooks, setWhyLoveBooks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whyLoveBooks.trim()) {
      onNext({
        favoriteBooks,
        whyLoveBooks: whyLoveBooks.trim(),
      });
    }
  };

  return (
    <div className="text-center animate-slideUp">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-amber-800 mb-6">
          Wonderful choices!
        </h2>
        <p className="text-xl text-amber-700 max-w-2xl mx-auto text-balance">
          Now tell me what makes these stories so special to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="whyLoveBooks" className="block text-lg font-medium text-amber-800 mb-3">
            What do you love most about these books?
          </label>
          <textarea
            id="whyLoveBooks"
            value={whyLoveBooks}
            onChange={(e) => setWhyLoveBooks(e.target.value)}
            placeholder="What makes them exciting? What do you love about the characters or adventures? (e.g., I love the magic and friendship, the funny characters make me laugh, etc.)"
            rows={4}
            className="input-field resize-none"
            required
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 border-2 border-amber-600 text-amber-600 rounded-xl
                     hover:bg-amber-600 hover:text-white transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!whyLoveBooks.trim()}
            className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create My Adventure ✨
          </button>
        </div>
      </form>
    </div>
  );
}

function GeneratingScreen() {
  return (
    <div className="text-center animate-fadeIn py-20">
      <div className="loading-spinner mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-amber-800 mb-4">
        Crafting Your Story...
      </h2>
      <p className="text-lg text-amber-700">
        Weaving together characters, choices, and magic just for you
      </p>
    </div>
  );
}

function ReadingScreen({ 
  story, 
  onRestart 
}: { 
  story: Story;
  onRestart: () => void;
}) {
  const currentSegment = story.segments[story.currentSegmentIndex];
  const isComplete = currentSegment?.isEnding || story.currentSegmentIndex === story.segments.length - 1;

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
          {story.title}
        </h1>
        <p className="text-lg text-amber-600 italic">
          {story.premise}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {story.segments.map((segment, index) => (
          <div key={segment.id} className="story-paragraph">
            <div className="story-text prose prose-lg max-w-none">
              {segment.text.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="story-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isComplete && (
          <div className="text-center mt-12 animate-slideUp">
            <div className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-xl p-8 border-2 border-amber-300/40">
              <h3 className="text-2xl font-bold text-amber-800 mb-4">
                The End
              </h3>
              <p className="text-amber-700 mb-6">
                What an incredible adventure! Your choices shaped this unique story.
              </p>
              <button
                onClick={onRestart}
                className="primary-button"
              >
                Begin Another Adventure ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceScreen({ 
  story, 
  choices, 
  onChoice, 
  onRestart 
}: { 
  story: Story;
  choices: StoryChoice[];
  onChoice: (choice: StoryChoice) => void;
  onRestart: () => void;
}) {
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
          {story.title}
        </h1>
        <p className="text-lg text-amber-600 italic">
          {story.premise}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {story.segments.map((segment, index) => (
          <div key={segment.id} className="story-paragraph">
            <div className="story-text prose prose-lg max-w-none">
              {segment.text.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="story-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 animate-slideUp">
          <h3 className="text-2xl font-bold text-amber-800 mb-6 text-center">
            What path will you choose?
          </h3>

          <div className="space-y-4 max-w-2xl mx-auto">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice)}
                className="choice-button"
              >
                <div className="font-medium text-amber-800 mb-2 text-lg leading-relaxed">
                  {choice.text}
                </div>
                <div className="text-sm text-amber-600 italic">
                  {choice.consequence}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={onRestart}
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200 underline"
            >
              Begin a completely new adventure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ 
  error, 
  canRetry, 
  onRetry, 
  onRestart 
}: { 
  error: string;
  canRetry: boolean;
  onRetry: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="text-center animate-fadeIn py-20">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-lg text-amber-700 mb-8">
          {error}
        </p>
        
        <div className="space-x-4">
          {canRetry && (
            <button
              onClick={onRetry}
              className="primary-button"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onRestart}
            className="px-8 py-4 border-2 border-amber-600 text-amber-600 rounded-xl
                     hover:bg-amber-600 hover:text-white transition-all duration-200"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}