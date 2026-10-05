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

async function generateContentWithRetry(params: any, maxRetries = 6): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errMsg = error?.message || error?.toString?.() || '';
      const status = error?.status || error?.code || error?.error?.code;
      const isRetryableError =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        status === 502 ||
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') ||
        errMsg.includes('Quota exceeded') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE');

      if (isRetryableError && attempt < maxRetries) {
        let delaySec = 7 * attempt;
        const match = errMsg.match(/retry in ([0-9.]+)s/i);
        if (match && match[1]) {
          delaySec = Math.ceil(parseFloat(match[1])) + 1;
        }
        console.warn(
          `[Gemini API] Retryable error (${status || 'Unknown'}) hit: ${errMsg.substring(0, 50)}... Waiting ${delaySec}s before auto-retry (Attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
      } else {
        throw error;
      }
    }
  }
}

function buildSystemInstruction(settings: any): string {
  const isVeo3 = settings.targetPlatform === 'veo3_video';
  const lang = settings.promptLanguage === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  
  let detailLevelDesc = '';
  if (isVeo3) {
    detailLevelDesc = settings.promptDetail === 'high'
      ? 'Extremely rich cinematic video description: explicit camera movements (e.g. slow pan, tracking shot, dolly in), precise subject actions, continuous motion, and evolving lighting/environments.'
      : settings.promptDetail === 'low'
      ? 'Concise video description, focusing on the core action, subject movement, and camera motion in full sentences.'
      : 'Balanced cinematic description: clear subject action, definite camera movement, lighting mood, and continuous flow in natural sentences.';
  } else {
    detailLevelDesc = settings.promptDetail === 'high'
      ? 'Extremely rich photographic detail: explicit camera lenses (e.g. 35mm portrait, macro), exact lighting (e.g. cinematic, volumetric, rim light), poses, and intricate background details using ComfyUI comma-separated tags.'
      : settings.promptDetail === 'low'
      ? 'Concise keywords, focused purely on core subject, simple action and environment using comma-separated tags (~15-25 words).'
      : 'Balanced photographic description: clear subject, definite pose, lighting mood, and aesthetic textures using comma-separated tags (~30-50 words).';
  }

  const roleDesc = isVeo3 
    ? 'You are a world-class AI visual prompt engineer specializing in cinematic text-to-video generation (e.g., Google Veo 3, Sora, Runway Gen-3).\nYour mission is to turn story script segments into masterful, production-grade video generation prompts.'
    : 'You are a world-class AI visual prompt engineer specializing in static image generation (e.g., Stable Diffusion, Midjourney, Flux, ComfyUI).\nYour mission is to turn story script segments into masterful, production-grade image generation prompts.';

  const tagGuideline = isVeo3
    ? '3. NATURAL LANGUAGE: Write prompts in highly descriptive, cinematic natural language sentences. Describe motion smoothly.'
    : '3. COMMA-SEPARATED TAGS: Use Danbooru/ComfyUI style tag format (e.g., "1boy, solo, looking at viewer, cinematic lighting, cyberpunk city, highly detailed"). Avoid conversational sentences.';

  const videoMotionRule = isVeo3
    ? '12. MOTION & CINEMATOGRAPHY: Explicitly describe camera movements (pan, tilt, zoom, dolly, tracking, drone shot) and continuous subject actions (walking, turning, talking, fighting). The prompt must describe a moving video, not a static image.'
    : '12. NO VIDEO/MOTION PROMPTS: Do NOT use video or motion keywords like "camera panning", "zooming", "slow motion", or "time lapse" in the prompt. Focus ONLY on static photography and static poses.';

  const postfixRule = isVeo3
    ? '' // No postfix needed for video, or we could add a video specific one, but none is strictly required.
    : '13. FORMATTING & QUALITY POSTFIX: Each prompt MUST conclude with this exact phrase: "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark."';

  const motionObjectRule = isVeo3
    ? '14. MOTION OBJECT: Since this is a video prompt, output a "motion" object with type "none" and strength "none", as the motion is already described in the text prompt.'
    : '14. MOTION OBJECT: Output a "motion" object describing the movement effect to apply to the image when editing the video (e.g. pan_right, zoom_in, zoom_out). This is NOT character animation and MUST NOT be included in the image prompt itself. Include "type" and "strength" (e.g., subtle, moderate).';

    const audioVeo3Rule = isVeo3
      ? '15. AUDIO IN PROMPT: If the script contains [BGM/SFX], [SFX], or [BGM] tags, explicitly include a sound description at the end of the "prompt" text (e.g. "Audio: Eerie white noise and screeching metal") so Veo 3 can generate the video with sound.'
      : '15. AUDIO: Do not include audio instructions in the visual prompt.';

  return `${roleDesc}

Key Guidelines:
1. LANGUAGE: The prompt text MUST be in ${lang}.
2. DETAIL LEVEL: ${detailLevelDesc}
${tagGuideline}
4. CHARACTER CONSISTENCY: ${settings.syncCharacters ? 'Meticulously preserve character visual traits across all scenes.' : 'Preserve main character traits.'}
5. CHARACTER FIELD: Output a "character" field listing all characters/entities present in the scene, separated by semicolons (e.g. "The Well; Villagers" or "" if none).
6. CHARACTER_INFO FIELD: Output a "character_info" field describing unchanging reference traits for each character present. If none, output "".
${settings.alwaysCallByName ? '7. CHARACTER NAMING: Always explicitly name each character and consistently refer to them by their defined name.' : ''}
${settings.immutableCharacterDetails ? '8. IMMUTABLE DETAILS: Incorporate Character Sheet details preserving unchanging core physical features.' : ''}
${settings.useEmotionsAndExpressions ? '9. EMOTIONS & EXPRESSIONS: Explicitly describe facial expressions (e.g., "smiling, crying, angry, sad eyes").' : ''}
${settings.useCameraAndFraming ? '10. CAMERA & FRAMING: Use precise framing descriptions (e.g., "cowboy shot, close-up, extreme close-up, depth of field, looking up").' : ''}
${settings.useLightingColor ? '11. LIGHTING & COLOR: Explicitly describe lighting and color (e.g., "neon lighting, cinematic lighting, muted colors").' : ''}
${videoMotionRule}
${postfixRule}
${motionObjectRule}
${audioVeo3Rule}
16. OUTPUT: Output must strictly conform to the required JSON schema with no markdown fences or extra text.
17. DIRECTING TAGS: If the scene text contains [Camera: ...], [BGM/SFX: ...], [SFX: ...], or [BGM: ...] tags, extract their contents into the "camera", "sfx", and "bgm" fields respectively. Incorporate the Camera instructions into the motion object.`;
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

    // Process scenes in small batches (up to 10 scenes per LLM call) to prevent LLM from omitting scenes
    const CHUNK_SIZE = 10;
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

      const isVeo3 = settings.targetPlatform === 'veo3_video';
      const promptEndingReq = isVeo3 
        ? "Ensure the prompt naturally describes the motion and cinematography in the scene."
        : 'Ensure every scene receives a high-quality, vivid prompt ending with "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark."';

      const userPrompt = `Generate cinematic story visual prompts for the following sequential story scenes:

Visual Styles: ${styleDescriptions || 'Cinematic photorealism'}
Content Genres: ${genreDescriptions || 'Narrative drama'}
Prefix to include at start: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}

Scenes to convert:
${JSON.stringify(scenesPayload, null, 2)}

${promptEndingReq} and character/character_info filled following all rules.`;

      const response = await generateContentWithRetry({
        model: settings.geminiModel || 'gemini-3.5-flash',
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
                camera: { type: Type.STRING },
                sfx: { type: Type.STRING },
                bgm: { type: Type.STRING },
                detectedCharacters: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                motion: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    strength: { type: Type.STRING },
                  },
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

    const isVeo3 = settings.targetPlatform === 'veo3_video';
    const promptEndingReq = isVeo3
      ? "Ensure the prompt naturally describes the motion and cinematography in the scene."
      : 'Ensure prompt ends with "Một ảnh tại một thời điểm, 16:9, không chữ, logo hoặc watermark."';

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

${promptEndingReq} and character/character_info are filled properly. Output in JSON format.`;

    const response = await generateContentWithRetry({
      model: settings.geminiModel || 'gemini-3.5-flash',
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
            camera: { type: Type.STRING },
            sfx: { type: Type.STRING },
            bgm: { type: Type.STRING },
            detectedCharacters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            motion: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                strength: { type: Type.STRING },
              },
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

    const isVeo3 = settings.targetPlatform === 'veo3_video';
    const promptTypeStr = isVeo3 ? 'Master Veo 3 Video Prompt' : 'Master Visual Prompt';

    const userPrompt = `Create ONE comprehensive, cinematic ${promptTypeStr} that encapsulates the essence, mood, climax, and characters of this entire story:

Story Script:
${story}

Visual Styles: ${styleDescriptions}
Genres: ${genreDescriptions}
Characters:
${JSON.stringify(characters || [], null, 2)}
Prefix: "${settings.fixedPrefix || ''}"
Aspect Ratio: ${settings.aspectRatio || '16:9'}

Return a single master prompt in JSON format.`;

    const response = await generateContentWithRetry({
      model: settings.geminiModel || 'gemini-3.5-flash',
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

app.post('/api/test-api-key', async (req, res) => {
  try {
    const { settings } = req.body;
    const model = settings?.geminiModel || 'gemini-3.5-flash';
    
    // Perform a very fast, cheap generation to test the key
    const response = await ai.models.generateContent({
      model: model,
      contents: "Reply with the exact word 'OK'",
    });

    if (response.text?.includes('OK')) {
      res.json({ success: true, message: `API Key hợp lệ! Đang dùng model: ${model}` });
    } else {
      res.json({ success: true, message: `Đã kết nối thành công tới ${model}.` });
    }
  } catch (error: any) {
    console.error('API Test Error:', error);
    const status = error?.status || error?.code || error?.error?.code;
    const errMsg = error?.message || error?.toString?.() || '';
    
    let userMsg = errMsg;
    if (status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      userMsg = 'Hết Quota (429)! Bạn đã dùng hết số lượt miễn phí hoặc quá tải trong phút này.';
    } else if (status === 404 || errMsg.includes('not found')) {
      userMsg = 'Lỗi 404: Model này không khả dụng cho API Key của bạn (Hãy thử model khác).';
    } else if (status === 401 || status === 403 || errMsg.includes('API_KEY_INVALID')) {
      userMsg = 'Lỗi xác thực: API Key không hợp lệ hoặc bị vô hiệu hóa.';
    }

    res.status(500).json({
      success: false,
      message: userMsg
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
