import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function buildSystemInstruction(settings: any): string {
  const lang = settings.promptLanguage === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English (recommended for Veo 3)';
  const detailLevelDesc =
    settings.promptDetail === 'high'
      ? 'Extremely rich cinematic detail: explicit camera lenses (e.g. 35mm anamorphic, 85mm portrait), precise camera motion (pan, tilt, slow push dolly, low-angle tracking), volumetric lighting, atmospheric haze, color temperature, and micro-facial expressions.'
      : settings.promptDetail === 'low'
      ? 'Concise, focused on core action and primary subject framing without overly verbose technical descriptors (~25-35 words).'
      : 'Balanced cinematic description: clear subject, definite action, camera angle and motion, lighting mood, and aesthetic textures (~45-70 words).';

  return `You are a world-class AI video prompt engineer specializing in Google Veo 3 (${settings.veoModel || 'Veo 3.1 Pro'}).
Your mission is to turn story script segments into masterful, production-grade video generation prompts designed specifically for Veo 3.

Key Veo 3 Video Prompt Guidelines:
1. LANGUAGE: The prompt text MUST be in ${lang}.
2. DETAIL LEVEL: ${detailLevelDesc}
3. CHARACTER CONSISTENCY: ${settings.syncCharacters ? 'Meticulously preserve characters across all scenes.' : 'Preserve main character traits.'}
${settings.alwaysCallByName ? '4. CHARACTER NAMING: Always explicitly name each character and consistently refer to them by their defined name in every prompt.' : ''}
${settings.immutableCharacterDetails ? '5. IMMUTABLE DETAILS: Write/incorporate Character Sheet details preserving unchanging core physical features (facial structure, hair, signature attire, identifiable marks).' : ''}
${settings.copyFullCharacterSheet ? '6. CHARACTER SHEET EMBEDDING: Embed the complete character sheet descriptions at the beginning or core of the prompt.' : ''}
${settings.individualCharacterSheets ? '7. MULTI-CHARACTER SHEETS: If multiple characters appear, clearly delineate individual character sheets for each character.' : ''}
${settings.useEmotionsAndExpressions ? '8. EMOTIONS & FACIAL EXPRESSIONS: Explicitly describe subtle facial expressions, micro-reactions, eye emotion, and mood.' : ''}
${settings.useCameraAndFraming ? '9. CAMERA ANGLE & FRAMING: Use precise keywords for camera angles (low-angle, high-angle, Dutch tilt, wide, close-up) and composition framing.' : ''}
${settings.useLightingColor ? '10. LIGHTING & COLOR: Explicitly detail lighting conditions (e.g. volumetric god rays, soft golden hour rim light, neon cyber reflections, moody chiaroscuro, color temperature).' : ''}
${settings.storyContinuityGoal ? '11. NARRATIVE FLOW: Craft prompts designed to form a smooth, coherent, flowing cinematic story.' : ''}
${settings.continuity ? '12. SCENE CONTINUITY: Subtly link the start of the current scene to the ending motion/position of the previous scene to create seamless filmic flow.' : ''}
${settings.matchDurationPrompts ? '13. PACING: Pace the visual action and camera movement to fit the calculated duration of the scene.' : ''}
${settings.includeVoiceLanguage ? '14. VOICE & LANGUAGE: Mention speech delivery tone, vocal cadence, and character voice language where relevant.' : ''}
15. FORMATTING: Each prompt should start with the fixed prefix if provided, describe the scene action and cinematography, and conclude with the model indicator [${settings.veoModel || 'Veo 3.1 Pro'}] and aspect ratio tag (--ar ${settings.aspectRatio || '16:9'})${settings.useSeed ? ` (--seed ${settings.seed || 42890})` : ''}.
16. OUTPUT: Output must strictly conform to the required JSON schema with no conversational fluff or markdown fences.`;
}

// Batch prompt generation
app.post('/api/generate-batch', async (req: Request, res: Response) => {
  try {
    const { scenes, characters, selectedStyles, selectedGenres, settings } = req.body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: 'No scenes provided' });
    }

    const systemInstruction = buildSystemInstruction(settings);

    // Style fragments
    const styleDescriptions = (selectedStyles || [])
      .map((s: any) => `${s.name}: ${s.fragment}`)
      .join('; ');
    const genreDescriptions = (selectedGenres || [])
      .map((g: any) => `${g.name}: ${g.fragment}`)
      .join('; ');

    // Process scenes in small batches (up to 8 scenes per LLM call) for maximum reliability and fast responses
    const CHUNK_SIZE = 8;
    const allResults: { sceneNumber: number; prompt: string; detectedCharacters: string[] }[] = [];

    for (let i = 0; i < scenes.length; i += CHUNK_SIZE) {
      const sceneChunk = scenes.slice(i, i + CHUNK_SIZE);

      const scenesPayload = sceneChunk.map((sc: any) => {
        // Filter characters for this scene if syncOnlyPresentCharacters or syncCharacters is enabled
        let relevantCharacters = characters || [];
        if (settings.syncOnlyPresentCharacters || (settings.syncCharacters && !settings.copyFullCharacterSheet)) {
          const filtered = (characters || []).filter((char: any) => {
            if (!char.name) return false;
            const reg = new RegExp(`\\b${char.name}\\b`, 'i');
            return reg.test(sc.text);
          });
          if (filtered.length > 0 || settings.syncOnlyPresentCharacters) {
            relevantCharacters = filtered;
          }
        }

        return {
          sceneNumber: sc.sceneNumber,
          durationSec: sc.duration || sc.estimatedDurationSec,
          originalScript: sc.text,
          activeCharacters: relevantCharacters.map((c: any) => ({
            name: c.name,
            description: c.description,
            voice: settings.includeVoiceLanguage ? c.voice : undefined,
          })),
        };
      });

      const userPrompt = `Generate Google Veo 3 video prompts for the following sequential story scenes:

Visual Styles: ${styleDescriptions || 'Cinematic photorealism'}
Content Genres: ${genreDescriptions || 'Narrative drama'}
Prefix to include at start: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}
Veo Model: ${settings.veoModel || 'Veo 3.1 Pro'}
${settings.useSeed ? `Fixed Seed: ${settings.seed}` : ''}

Scenes to convert:
${JSON.stringify(scenesPayload, null, 2)}

Ensure every scene receives a high-quality, vivid, cinematic Veo 3 video prompt following all rules.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                prompt: { type: Type.STRING },
                detectedCharacters: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['sceneNumber', 'prompt'],
            },
          },
        },
      });

      const text = response.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            allResults.push(...parsed);
          }
        } catch (parseErr) {
          console.error('Failed to parse chunk JSON:', text, parseErr);
        }
      }
    }

    res.json({ results: allResults });
  } catch (error: any) {
    console.error('Error generating prompts:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate prompts via Gemini API',
    });
  }
});

// Single scene prompt generation / regeneration
app.post('/api/generate-single', async (req: Request, res: Response) => {
  try {
    const { scene, previousScenePrompt, nextSceneText, characters, selectedStyles, selectedGenres, settings } =
      req.body;

    if (!scene) {
      return res.status(400).json({ error: 'No scene provided' });
    }

    const systemInstruction = buildSystemInstruction(settings);

    const styleDescriptions = (selectedStyles || [])
      .map((s: any) => `${s.name}: ${s.fragment}`)
      .join('; ');
    const genreDescriptions = (selectedGenres || [])
      .map((g: any) => `${g.name}: ${g.fragment}`)
      .join('; ');

    let relevantCharacters = characters || [];
    if (settings.syncOnlyPresentCharacters || (settings.syncCharacters && !settings.copyFullCharacterSheet)) {
      const filtered = (characters || []).filter((char: any) => {
        if (!char.name) return false;
        const reg = new RegExp(`\\b${char.name}\\b`, 'i');
        return reg.test(scene.text);
      });
      if (filtered.length > 0 || settings.syncOnlyPresentCharacters) {
        relevantCharacters = filtered;
      }
    }

    const userPrompt = `Generate a single Google Veo 3 prompt for Scene #${scene.sceneNumber}:
Script: "${scene.text}"
Estimated Duration: ~${scene.duration || scene.estimatedDurationSec}s
${previousScenePrompt ? `Previous Scene Prompt (for continuity): "${previousScenePrompt}"` : ''}
${nextSceneText ? `Upcoming Scene Script: "${nextSceneText}"` : ''}
Visual Styles: ${styleDescriptions || 'Cinematic photorealism'}
Content Genres: ${genreDescriptions || 'Narrative drama'}
Prefix to include at start: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}
Veo Model: ${settings.veoModel || 'Veo 3.1 Pro'}
${settings.useSeed ? `Fixed Seed: ${settings.seed}` : ''}
Characters in this scene:
${JSON.stringify(relevantCharacters, null, 2)}

Output the single prompt in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            prompt: { type: Type.STRING },
            detectedCharacters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['sceneNumber', 'prompt'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating single prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate prompt',
    });
  }
});

// Full summary single prompt generation (when "Một prompt (Tóm tắt)" is chosen)
app.post('/api/generate-summary', async (req: Request, res: Response) => {
  try {
    const { story, characters, selectedStyles, selectedGenres, settings } = req.body;

    const systemInstruction = buildSystemInstruction(settings);

    const styleDescriptions = (selectedStyles || [])
      .map((s: any) => `${s.name}: ${s.fragment}`)
      .join('; ');
    const genreDescriptions = (selectedGenres || [])
      .map((g: any) => `${g.name}: ${g.fragment}`)
      .join('; ');

    const userPrompt = `Create ONE comprehensive, cinematic Master Veo 3 Video Prompt that encapsulates the essence, mood, climax, and characters of this entire story:

Story Script:
${story}

Visual Styles: ${styleDescriptions}
Genres: ${genreDescriptions}
Characters:
${JSON.stringify(characters || [], null, 2)}
Prefix: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}
Veo Model: ${settings.veoModel || 'Veo 3.1 Pro'}

Return a single master prompt in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
          },
          required: ['prompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating summary prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate summary prompt',
    });
  }
});

// Dev vs Prod Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
