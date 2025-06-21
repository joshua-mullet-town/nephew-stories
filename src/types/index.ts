export interface UserPreferences {
  favoriteBooks: string;
  whyLoveBooks: string;
}

export interface Character {
  name: string;
  description: string;
  personality: string[];
  role: 'protagonist' | 'ally' | 'mentor' | 'antagonist' | 'sidekick';
}

export interface StoryContext {
  setting: string;
  timeOfDay: string;
  mood: string;
  theme: string;
  previousEvents: string[];
  characters: Character[];
}

export interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
  leadTo: string; // What this choice leads to
  impact: 'major' | 'minor'; // How much this affects the story
  preGeneratedSegment?: StorySegment; // Pre-generated next segment
}

export interface StorySegment {
  id: string;
  text: string;
  context: StoryContext;
  choices?: StoryChoice[];
  isEnding?: boolean;
  backgroundScene?: string; // Description for background generation
}

export interface CompleteStory {
  id: string;
  title: string;
  premise: string;
  characters: Character[];
  theme: string;
  segments: StorySegment[];
  allPossiblePaths: Map<string, StorySegment[]>; // Pre-generated paths
}

export interface Story {
  id: string;
  title: string;
  premise: string;
  characters: Character[];
  theme: string;
  segments: StorySegment[];
  currentSegmentIndex: number;
  userChoices: string[];
  chosenPath: string[];
}

export interface GenerateStoryRequest {
  favoriteBooks: string;
  whyLoveBooks: string;
  generateComplete?: boolean; // Generate entire story tree
}

export interface GenerateStoryResponse {
  success: boolean;
  story?: CompleteStory;
  error?: string;
}

export type AppState = 
  | { step: 'welcome' }
  | { step: 'preferences'; favoriteBooks?: string }
  | { step: 'generating'; preferences: UserPreferences }
  | { step: 'reading'; story: Story; preferences: UserPreferences }
  | { step: 'choice'; story: Story; preferences: UserPreferences; choices: StoryChoice[] }
  | { step: 'error'; error: string; canRetry: boolean }