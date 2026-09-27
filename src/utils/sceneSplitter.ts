import { AppSettings, Character, Scene } from '../types';

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function splitStoryIntoScenes(
  story: string,
  settings: AppSettings,
  characters: Character[] = []
): Scene[] {
  if (!story || !story.trim()) {
    return [];
  }

  const cleanStory = story.trim();

  // Split into raw sentences
  // Match period, exclamation, question mark, ellipsis or multiple newlines
  const rawSentences = cleanStory
    .split(/(?<=[.!?…\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSentences.length === 0) {
    return [];
  }

  const rawScenes: string[] = [];

  if (settings.splitMode === 'single_sentence') {
    // 1 sentence = 1 scene
    rawScenes.push(...rawSentences);
  } else {
    // Speech rate mode (~8s per scene)
    // Check if a fixed target duration minutes was specified
    let targetWords = settings.wordsPerScene || 22;

    if (settings.targetDurationMinutes !== 'auto') {
      const minutes =
        settings.targetDurationMinutes === 'custom'
          ? settings.customMinutes || 3
          : parseFloat(settings.targetDurationMinutes);

      if (!isNaN(minutes) && minutes > 0) {
        const totalDurationSec = minutes * 60;
        const targetScenesCount = Math.max(1, Math.round(totalDurationSec / 8));
        const totalStoryWords = countWords(cleanStory);
        targetWords = Math.max(12, Math.min(55, Math.round(totalStoryWords / targetScenesCount)));
      }
    }

    let currentChunk: string[] = [];
    let currentWords = 0;

    for (let i = 0; i < rawSentences.length; i++) {
      const sentence = rawSentences[i];
      const sentenceWords = countWords(sentence);

      // If adding this sentence exceeds target words and current chunk is not empty
      if (currentWords + sentenceWords > targetWords * 1.35 && currentChunk.length > 0) {
        rawScenes.push(currentChunk.join(' '));
        currentChunk = [sentence];
        currentWords = sentenceWords;
      } else {
        currentChunk.push(sentence);
        currentWords += sentenceWords;

        // If reached or exceeded target words
        if (currentWords >= targetWords) {
          rawScenes.push(currentChunk.join(' '));
          currentChunk = [];
          currentWords = 0;
        }
      }
    }

    if (currentChunk.length > 0) {
      // If the last remaining chunk is very small (less than 6 words) and there's a previous scene, merge it
      if (rawScenes.length > 0 && currentWords < 7) {
        rawScenes[rawScenes.length - 1] += ' ' + currentChunk.join(' ');
      } else {
        rawScenes.push(currentChunk.join(' '));
      }
    }
  }

  // Build full scene objects
  let cumulativeSeconds = 0;
  const scenes: Scene[] = rawScenes.map((text, idx) => {
    const words = countWords(text);
    // Estimated speech duration: ~2.75 words per second
    let durationSec = Math.max(3, Math.round(words / 2.75));
    if (settings.splitMode === 'speech_rate') {
      // Typically clamped around 7 - 9s for speech rate mode
      durationSec = Math.max(5, Math.min(12, Math.round(words / 2.75)));
    }

    const startTimeFormatted = formatTime(cumulativeSeconds);
    cumulativeSeconds += durationSec;

    // Detect characters appearing in this scene
    const detected = characters
      .filter((char) => {
        if (!char.name || !char.name.trim()) return false;
        const regex = new RegExp(`\\b${escapeRegExp(char.name.trim())}\\b`, 'i');
        return regex.test(text);
      })
      .map((c) => c.name);

    return {
      id: idx + 1,
      sceneNumber: idx + 1,
      text,
      words,
      estimatedDurationSec: durationSec,
      startTimeFormatted,
      status: 'idle',
      detectedCharacters: detected,
    };
  });

  return scenes;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
