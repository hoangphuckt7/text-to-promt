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

export function formatTimestampSrt(seconds: number): string {
  const ms = Math.floor((seconds % 1) * 1000);
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export interface ParsedSubtitle {
  id: number;
  start: string;
  end: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export function isSrtFormat(text: string): boolean {
  if (!text) return false;
  return text.includes('-->') && /\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(text);
}

export function parseSrt(srtContent: string): ParsedSubtitle[] {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/);
  const subs: ParsedSubtitle[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
    if (timeLineIdx === -1) continue;

    const id = parseInt(lines[0], 10) || subs.length + 1;
    const timeParts = lines[timeLineIdx].split('-->').map((t) => t.trim());
    const start = timeParts[0].replace('.', ',');
    const end = timeParts[1].replace('.', ',');
    const text = lines.slice(timeLineIdx + 1).join(' ').trim();

    if (text) {
      subs.push({
        id,
        start,
        end,
        startSeconds: parseSrtTimeToSeconds(start),
        endSeconds: parseSrtTimeToSeconds(end),
        text,
      });
    }
  }
  return subs;
}

function parseSrtTimeToSeconds(timeStr: string): number {
  const [hms, ms] = timeStr.replace('.', ',').split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0) + parseInt(ms || '0', 10) / 1000;
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

  // 1. Check if the input is in SRT format
  if (isSrtFormat(cleanStory)) {
    const subtitles = parseSrt(cleanStory);
    if (subtitles.length === 0) return [];

    interface SubGroup {
      subs: ParsedSubtitle[];
      text: string;
      start_at: string;
      end_at: string;
      durationSec: number;
    }

    const groups: SubGroup[] = [];

    if (settings.splitMode === 'single_sentence') {
      // 1 subtitle line = 1 scene
      for (const s of subtitles) {
        const dur = Math.max(2, Math.round(s.endSeconds - s.startSeconds));
        groups.push({
          subs: [s],
          text: s.text,
          start_at: s.start,
          end_at: s.end,
          durationSec: dur,
        });
      }
    } else {
      // Group subtitles by speech rate (~22 words or ~7-9s per scene)
      let currentSubs: ParsedSubtitle[] = [];
      let currentWords = 0;

      for (let i = 0; i < subtitles.length; i++) {
        const s = subtitles[i];
        const wCount = countWords(s.text);

        if (
          (currentWords + wCount > (settings.wordsPerScene || 22) * 1.35 ||
            (currentSubs.length > 0 && s.endSeconds - currentSubs[0].startSeconds >= 10)) &&
          currentSubs.length > 0
        ) {
          const startSub = currentSubs[0];
          const endSub = currentSubs[currentSubs.length - 1];
          const dur = Math.max(3, Math.round(endSub.endSeconds - startSub.startSeconds));
          groups.push({
            subs: [...currentSubs],
            text: currentSubs.map((item) => item.text).join(' '),
            start_at: startSub.start,
            end_at: endSub.end,
            durationSec: dur,
          });
          currentSubs = [s];
          currentWords = wCount;
        } else {
          currentSubs.push(s);
          currentWords += wCount;
          if (currentWords >= (settings.wordsPerScene || 22)) {
            const startSub = currentSubs[0];
            const endSub = currentSubs[currentSubs.length - 1];
            const dur = Math.max(3, Math.round(endSub.endSeconds - startSub.startSeconds));
            groups.push({
              subs: [...currentSubs],
              text: currentSubs.map((item) => item.text).join(' '),
              start_at: startSub.start,
              end_at: endSub.end,
              durationSec: dur,
            });
            currentSubs = [];
            currentWords = 0;
          }
        }
      }

      if (currentSubs.length > 0) {
        const startSub = currentSubs[0];
        const endSub = currentSubs[currentSubs.length - 1];
        const dur = Math.max(3, Math.round(endSub.endSeconds - startSub.startSeconds));
        groups.push({
          subs: [...currentSubs],
          text: currentSubs.map((item) => item.text).join(' '),
          start_at: startSub.start,
          end_at: endSub.end,
          durationSec: dur,
        });
      }
    }

    return groups.map((g, idx) => {
      const isLast = idx === groups.length - 1;
      const sceneCode = `SC${(idx + 1).toString().padStart(2, '0')}`;
      const detected = characters
        .filter((char) => {
          if (!char.name || !char.name.trim()) return false;
          // Fix Vietnamese unicode word boundary issue instead of standard \b
        const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escapeRegExp(char.name.trim())}(?:[^\\p{L}\\p{N}_]|$)`, 'iu');
          return regex.test(g.text);
        })
        .map((c) => c.name);

      const characterInfoStr = characters
        .filter((c) => detected.includes(c.name) && c.description)
        .map((c) => `${c.name}: ${c.description}`)
        .join('; ');

      return {
        id: idx + 1,
        sceneNumber: idx + 1,
        sceneCode,
        text: g.text,
        words: countWords(g.text),
        estimatedDurationSec: g.durationSec,
        startTimeFormatted: g.start_at.substring(0, 5), // "MM:SS"
        start_at: g.start_at,
        end_at: isLast ? 'AUDIO_END' : g.end_at,
        subtitle_ids: g.subs.map((s) => s.id),
        character: detected.join('; '),
        character_info: characterInfoStr,
        motion: { type: 'none', strength: 'subtle' },
        status: 'idle',
        detectedCharacters: detected,
      };
    });
  }

  // 2. Regular Text Processing
  const rawSentences = cleanStory
    .split(/(?<=[.!?…\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSentences.length === 0) {
    return [];
  }

  interface ChunkInfo {
    text: string;
    sentenceIndices: number[]; // 1-based index
  }

  const rawChunks: ChunkInfo[] = [];

  if (settings.splitMode === 'single_sentence') {
    rawSentences.forEach((s, idx) => {
      rawChunks.push({
        text: s,
        sentenceIndices: [idx + 1],
      });
    });
  } else {
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

    let currentChunkSentences: string[] = [];
    let currentChunkIndices: number[] = [];
    let currentWords = 0;

    for (let i = 0; i < rawSentences.length; i++) {
      const sentence = rawSentences[i];
      const sentenceWords = countWords(sentence);

      if (currentWords + sentenceWords > targetWords * 1.35 && currentChunkSentences.length > 0) {
        rawChunks.push({
          text: currentChunkSentences.join(' '),
          sentenceIndices: [...currentChunkIndices],
        });
        currentChunkSentences = [sentence];
        currentChunkIndices = [i + 1];
        currentWords = sentenceWords;
      } else {
        currentChunkSentences.push(sentence);
        currentChunkIndices.push(i + 1);
        currentWords += sentenceWords;

        if (currentWords >= targetWords) {
          rawChunks.push({
            text: currentChunkSentences.join(' '),
            sentenceIndices: [...currentChunkIndices],
          });
          currentChunkSentences = [];
          currentChunkIndices = [];
          currentWords = 0;
        }
      }
    }

    if (currentChunkSentences.length > 0) {
      if (rawChunks.length > 0 && currentWords < 7) {
        rawChunks[rawChunks.length - 1].text += ' ' + currentChunkSentences.join(' ');
        rawChunks[rawChunks.length - 1].sentenceIndices.push(...currentChunkIndices);
      } else {
        rawChunks.push({
          text: currentChunkSentences.join(' '),
          sentenceIndices: [...currentChunkIndices],
        });
      }
    }
  }

  // Build full scene objects
  let cumulativeSeconds = 0;
  const scenes: Scene[] = rawChunks.map((chunk, idx) => {
    const isLast = idx === rawChunks.length - 1;
    const sceneCode = `SC${(idx + 1).toString().padStart(2, '0')}`;
    const words = countWords(chunk.text);
    let durationSec = Math.max(3, Math.round(words / 2.75));
    if (settings.splitMode === 'speech_rate') {
      durationSec = Math.max(5, Math.min(12, Math.round(words / 2.75)));
    }

    const startSec = cumulativeSeconds;
    const endSec = cumulativeSeconds + durationSec;
    const start_at = formatTimestampSrt(startSec);
    const end_at = isLast ? 'AUDIO_END' : formatTimestampSrt(endSec);
    const startTimeFormatted = formatTime(cumulativeSeconds);
    cumulativeSeconds = endSec;

    const detected = characters
      .filter((char) => {
        if (!char.name || !char.name.trim()) return false;
        // Fix Vietnamese unicode word boundary issue instead of standard \b
        const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escapeRegExp(char.name.trim())}(?:[^\\p{L}\\p{N}_]|$)`, 'iu');
        return regex.test(chunk.text);
      })
      .map((c) => c.name);

    const characterInfoStr = characters
      .filter((c) => detected.includes(c.name) && c.description)
      .map((c) => `${c.name}: ${c.description}`)
      .join('; ');

    return {
      id: idx + 1,
      sceneNumber: idx + 1,
      sceneCode,
      text: chunk.text,
      words,
      estimatedDurationSec: durationSec,
      startTimeFormatted,
      start_at,
      end_at,
      subtitle_ids: chunk.sentenceIndices,
      character: detected.join('; '),
      character_info: characterInfoStr,
      motion: { type: 'none', strength: 'subtle' },
      status: 'idle',
      detectedCharacters: detected,
    };
  });

  return scenes;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
