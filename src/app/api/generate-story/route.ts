import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { GenerateStoryRequest, CompleteStory, StorySegment, Character, StoryChoice, StoryContext } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Modern storytelling principles
const STORYTELLING_PRINCIPLES = `
CORE STORYTELLING PRINCIPLES FOR CHILDREN:

1. NARRATIVE STRUCTURE:
   - Clear beginning, middle, and end
   - Hero's journey adapted for children
   - Problem → Action → Resolution
   - Build tension and release it satisfyingly

2. CHARACTER DEVELOPMENT:
   - Relatable protagonist with clear wants/needs
   - Character growth through choices
   - Consistent character traits and voice
   - Support characters with distinct personalities

3. MEANINGFUL CHOICES:
   - Each choice should stem from character motivation
   - Choices reveal character values
   - Consequences should feel logical and earned
   - No "right" or "wrong" choices, just different paths

4. EMOTIONAL ENGAGEMENT:
   - Create empathy for the protagonist
   - Build emotional stakes (what could be lost/gained?)
   - Include moments of wonder, excitement, and reflection
   - Age-appropriate challenges and conflicts

5. PACING & FLOW:
   - Vary sentence length and rhythm
   - Balance action with character moments
   - Use cliffhangers effectively
   - Give readers time to absorb important moments

6. WORLD BUILDING:
   - Consistent rules and logic
   - Rich sensory details
   - Settings that enhance the story
   - Cultural sensitivity and inclusivity

7. THEME INTEGRATION:
   - Themes emerge naturally from story events
   - Avoid heavy-handed moralizing
   - Let children draw their own conclusions
   - Focus on universal values: friendship, courage, kindness
`;

export async function POST(request: NextRequest) {
  try {
    const { favoriteBooks, whyLoveBooks }: GenerateStoryRequest = await request.json();

    if (!favoriteBooks || !whyLoveBooks) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Create the story foundation
    const storyFoundation = await generateStoryFoundation(favoriteBooks, whyLoveBooks);
    
    // Step 2: Generate the complete story tree
    const completeStory = await generateCompleteStoryTree(storyFoundation, favoriteBooks, whyLoveBooks);

    return NextResponse.json({ success: true, story: completeStory });

  } catch (error) {
    console.error('Story generation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate story'
      },
      { status: 500 }
    );
  }
}

async function generateStoryFoundation(favoriteBooks: string, whyLoveBooks: string) {
  const systemPrompt = `You are a master children's storyteller and narrative architect. Your task is to create the foundation for an interactive story.

${STORYTELLING_PRINCIPLES}

Based on the child's favorite books and what they love about them, create a story foundation that will resonate deeply with them.

Child's Input:
- Favorite books: ${favoriteBooks}
- What they love: ${whyLoveBooks}

CRITICAL: Return ONLY a valid JSON object with this exact structure. Do NOT wrap in markdown code blocks or add any explanatory text:
{
  "title": "Engaging story title",
  "premise": "2-3 sentence story premise that hooks the reader",
  "theme": "Central theme (friendship, courage, discovery, etc.)",
  "protagonist": {
    "name": "Character name",
    "description": "Physical description",
    "personality": ["trait1", "trait2", "trait3"],
    "role": "protagonist"
  },
  "supportingCharacters": [
    {
      "name": "Character name",
      "description": "Description",
      "personality": ["trait1", "trait2"],
      "role": "ally" or "mentor" or "sidekick"
    }
  ],
  "setting": "Vivid description of the main setting",
  "centralConflict": "What challenge/problem drives the story forward",
  "backgroundScene": "Description for visual background generation"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }],
    temperature: 0.8,
    max_tokens: 1000,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No response from OpenAI for story foundation');
  }

  // Clean up the response by removing markdown code blocks if present
  const cleanedResponse = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('Failed to parse story foundation response:', responseText);
    throw new Error('Invalid JSON response from AI for story foundation');
  }
}

async function generateCompleteStoryTree(foundation: any, favoriteBooks: string, whyLoveBooks: string): Promise<CompleteStory> {
  const systemPrompt = `You are creating a complete interactive story tree. This story will have exactly 4 segments with 2 choices each (except the final endings).

${STORYTELLING_PRINCIPLES}

STORY STRUCTURE:
- Segment 1: Opening & First Choice (2 options)
- Segment 2A/2B: Development based on first choice (2 options each)  
- Segment 3A/3B/3C/3D: Resolution based on second choice (endings)

REQUIREMENTS:
- Each segment should be 180-220 words
- Maintain character consistency throughout all paths
- Choices should feel meaningful and have clear consequences
- Each path should feel complete and satisfying
- Use rich sensory details and emotional engagement

Story Foundation:
${JSON.stringify(foundation, null, 2)}

Child's Preferences:
- Favorite books: ${favoriteBooks}
- What they love: ${whyLoveBooks}

CRITICAL: Return ONLY a valid JSON object with this exact structure. Do NOT wrap in markdown code blocks or add any explanatory text:
{
  "id": "story_${Date.now()}",
  "title": "${foundation.title}",
  "premise": "${foundation.premise}",
  "theme": "${foundation.theme}",
  "characters": [array of all characters with consistent details],
  "segments": [
    {
      "id": "segment_1",
      "text": "Opening segment text...",
      "context": {
        "setting": "Current location",
        "timeOfDay": "morning/afternoon/evening/night",
        "mood": "Current emotional tone",
        "theme": "Theme being explored",
        "previousEvents": [],
        "characters": [characters present in this segment]
      },
      "backgroundScene": "Scene description for background image",
      "choices": [
        {
          "id": "choice_1a",
          "text": "Choice description",
          "consequence": "What this leads to",
          "leadTo": "segment_2a",
          "impact": "major"
        },
        {
          "id": "choice_1b", 
          "text": "Choice description",
          "consequence": "What this leads to",
          "leadTo": "segment_2b",
          "impact": "major"
        }
      ]
    },
    ... (continue for all segments including segment_2a, segment_2b, segment_3a, segment_3b, segment_3c, segment_3d)
  ]
}

CRITICAL: Ensure character names and traits remain consistent across ALL segments. Track what happens in each path carefully.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No response from OpenAI for complete story');
  }

  // Clean up the response by removing markdown code blocks if present
  const cleanedResponse = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  let storyData;
  try {
    storyData = JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('Failed to parse complete story response:', responseText);
    throw new Error('Invalid JSON response from AI for complete story');
  }
  
  // Create the complete story with all possible paths pre-generated
  const completeStory: CompleteStory = {
    ...storyData,
    allPossiblePaths: new Map()
  };

  // Build path map for quick access
  const pathMap = new Map<string, StorySegment[]>();
  
  // Path 1: segment_1 → segment_2a → segment_3a
  pathMap.set('1a-a', [
    storyData.segments.find((s: any) => s.id === 'segment_1'),
    storyData.segments.find((s: any) => s.id === 'segment_2a'),
    storyData.segments.find((s: any) => s.id === 'segment_3a')
  ]);
  
  // Path 2: segment_1 → segment_2a → segment_3b
  pathMap.set('1a-b', [
    storyData.segments.find((s: any) => s.id === 'segment_1'),
    storyData.segments.find((s: any) => s.id === 'segment_2a'),
    storyData.segments.find((s: any) => s.id === 'segment_3b')
  ]);
  
  // Path 3: segment_1 → segment_2b → segment_3c
  pathMap.set('1b-c', [
    storyData.segments.find((s: any) => s.id === 'segment_1'),
    storyData.segments.find((s: any) => s.id === 'segment_2b'),
    storyData.segments.find((s: any) => s.id === 'segment_3c')
  ]);
  
  // Path 4: segment_1 → segment_2b → segment_3d
  pathMap.set('1b-d', [
    storyData.segments.find((s: any) => s.id === 'segment_1'),
    storyData.segments.find((s: any) => s.id === 'segment_2b'),
    storyData.segments.find((s: any) => s.id === 'segment_3d')
  ]);

  completeStory.allPossiblePaths = pathMap;

  return completeStory;
}