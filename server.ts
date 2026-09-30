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

async function generateContentWithRetry(params: any, maxRetries = 4): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errMsg = error?.message || error?.toString?.() || '';
      const status = error?.status || error?.code || error?.error?.code;
      const isRateLimit =
        status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') ||
        errMsg.includes('Quota exceeded');

      if (isRateLimit && attempt < maxRetries) {
        let delaySec = 7 * attempt;
        const match = errMsg.match(/retry in ([0-9.]+)s/i);
        if (match && match[1]) {
          delaySec = Math.ceil(parseFloat(match[1])) + 1;
        }
        console.warn(
          `[Gemini API] Rate limit (429) hit. Waiting ${delaySec}s before auto-retry (Attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
      } else {
        throw error;
      }
    }
  }
}

function buildSystemInstruction(settings: any): string {
  const lang = settings.promptLanguage === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English (recommended for Veo 3 / Image generation)';
  const detailLevelDesc =
    settings.promptDetail === 'high'
      ? 'Extremely rich cinematic detail: explicit camera lenses (e.g. 35mm anamorphic, 85mm portrait), precise framing, volumetric lighting, atmospheric haze, color palette, and micro-facial expressions.'
      : settings.promptDetail === 'low'
      ? 'Concise, focused on core action and primary subject framing without overly verbose technical descriptors (~25-35 words).'
      : 'Balanced cinematic description: clear subject, definite action, camera angle, lighting mood, and aesthetic textures (~45-70 words).';

  return `You are a world-class AI visual prompt engineer specializing in story image and video generation.
Your mission is to turn story script segments into masterful, production-grade visual prompts with character consistency.

Key Guidelines:
1. LANGUAGE: The prompt text MUST be in ${lang}.
2. DETAIL LEVEL: ${detailLevelDesc}
3. CHARACTER CONSISTENCY: ${settings.syncCharacters ? 'Meticulously preserve characters across all scenes.' : 'Preserve main character traits.'}
4. CHARACTER FIELD: Output a "character" field listing all characters/entities present in the scene, separated by semicolons (e.g. "The Well; Villagers" or "" if none).
5. CHARACTER_INFO FIELD: Output a "character_info" field describing unchanging reference traits for each character present (e.g. "The Well: giếng đá xám tối hình tròn, vết đen nguệch ngoạc, miệng đen tuyền theo ảnh tham chiếu; Character: mô tả..."). If none, output "".
${settings.alwaysCallByName ? '6. CHARACTER NAMING: Always explicitly name each character and consistently refer to them by their defined name in every prompt.' : ''}
${settings.immutableCharacterDetails ? '7. IMMUTABLE DETAILS: Incorporate Character Sheet details preserving unchanging core physical features.' : ''}
${settings.useEmotionsAndExpressions ? '8. EMOTIONS & FACIAL EXPRESSIONS: Explicitly describe subtle facial expressions, micro-reactions, eye emotion, and mood.' : ''}
${settings.useCameraAndFraming ? '9. CAMERA ANGLE & FRAMING: Use precise keywords for camera angles and composition framing.' : ''}
${settings.useLightingColor ? '10. LIGHTING & COLOR: Explicitly detail lighting conditions and color palette.' : ''}
11. FORMATTING & QUALITY POSTFIX: Each prompt MUST describe the visual action and scenery, incorporate the chosen Visual Styles and Content Genres, and conclude with this exact phrase: "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark."
12. OUTPUT: Output must strictly conform to the required JSON schema with no markdown fences or extra conversational text.`;
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

    // Process scenes in large batches (up to 20 scenes per LLM call) to minimize rate limit quota hits
    const CHUNK_SIZE = 20;
    const allResults: {
      sceneNumber: number;
      character?: string;
      character_info?: string;
      prompt: string;
      detectedCharacters?: string[];
    }[] = [];

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
          sceneCode: sc.sceneCode || `SC${sc.sceneNumber.toString().padStart(2, '0')}`,
          durationSec: sc.duration || sc.estimatedDurationSec,
          originalScript: sc.text,
          activeCharacters: relevantCharacters.map((c: any) => ({
            name: c.name,
            description: c.description,
            voice: settings.includeVoiceLanguage ? c.voice : undefined,
          })),
        };
      });

      const userPrompt = `Generate cinematic story visual prompts for the following sequential story scenes:

Visual Styles: ${styleDescriptions || 'Cinematic photorealism'}
Content Genres: ${genreDescriptions || 'Narrative drama'}
Prefix to include at start: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}

Scenes to convert:
${JSON.stringify(scenesPayload, null, 2)}

Ensure every scene receives a high-quality, vivid prompt ending with "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark." and character/character_info filled following all rules.`;

      const response = await generateContentWithRetry({
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
                character: { type: Type.STRING },
                character_info: { type: Type.STRING },
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

    const userPrompt = `Generate a single cinematic visual prompt for Scene #${scene.sceneNumber}:
Script: "${scene.text}"
Estimated Duration: ~${scene.duration || scene.estimatedDurationSec}s
${previousScenePrompt ? `Previous Scene Prompt (for continuity): "${previousScenePrompt}"` : ''}
${nextSceneText ? `Upcoming Scene Script: "${nextSceneText}"` : ''}
Visual Styles: ${styleDescriptions || 'Cinematic photorealism'}
Content Genres: ${genreDescriptions || 'Narrative drama'}
Prefix to include at start: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}
Characters in this scene:
${JSON.stringify(relevantCharacters, null, 2)}

Ensure prompt ends with "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark." and character/character_info are filled properly. Output in JSON format.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            character: { type: Type.STRING },
            character_info: { type: Type.STRING },
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

    const response = await generateContentWithRetry({
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
