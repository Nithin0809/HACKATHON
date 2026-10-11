import { GoogleGenAI } from '@google/genai';
import { ProductionKit, ReelBriefForm } from '@/types/reelforge';

export function getSampleKit(input: Partial<ReelBriefForm> & { selectedHook?: string }): ProductionKit {
  const topic = input.topic || 'Build better habits';
  const niche = input.niche || 'Creator education';
  const audience = input.audience || 'Beginners';
  const platform = input.platform || 'Instagram Reels';
  const tone = input.tone || 'Conversational';
  const duration = Number(input.duration || 30);
  const hooks = [
    { text: `You're probably approaching ${topic.toLowerCase()} all wrong.`, angle: 'Curiosity / challenge' },
    { text: `Nobody tells beginners this about ${topic.toLowerCase()}.`, angle: 'Insider insight' },
    { text: `Stop scrolling if you want to get better at ${topic.toLowerCase()}.`, angle: 'Direct call-out' }
  ];
  const opening = input.selectedHook?.trim() || hooks[0].text;
  const shots = [
    { time: '0–3s', duration: 3, title: 'Pattern interrupt', voiceover: opening, visual: 'Start on a tight close-up; look directly into the lens.', camera: 'Tight close-up, subtle push-in', overlay: "YOU'RE DOING THIS WRONG", edit: 'Hard cut on first word; punch-in at 1.5s', audio: 'Short impact hit, then music bed' },
    { time: '3–9s', duration: 6, title: 'Make the problem relatable', voiceover: `Most people in ${audience.toLowerCase()} focus on the obvious part of ${topic.toLowerCase()} and miss what actually moves the needle.`, visual: 'Show the common mistake, process, or before-state as B-roll.', camera: 'Over-the-shoulder / medium shot', overlay: 'THE COMMON MISTAKE', edit: 'Three quick cuts; highlight one keyword per beat', audio: 'Light whoosh between cuts' },
    { time: '9–18s', duration: 9, title: 'Deliver the useful insight', voiceover: 'Instead, simplify it: pick one clear goal, make the next step obvious, and repeat what works.', visual: 'Demonstrate the better approach on screen; show the result, not just the explanation.', camera: 'Screen recording + hands-on detail shot', overlay: 'ONE GOAL → ONE NEXT STEP', edit: 'Cut to demonstration; use a speed ramp only if it adds clarity', audio: 'Music builds slightly under the reveal' },
    { time: '18–25s', duration: 7, title: 'Show proof or an example', voiceover: 'Try this once today and compare the result with your usual approach.', visual: 'Show a concrete example, a before/after, or a quick checklist.', camera: 'Medium shot followed by detail insert', overlay: 'TRY THIS TODAY', edit: 'Use a clean match cut into the example', audio: 'Soft click / confirmation sound' },
    { time: `${Math.max(25, duration - 5)}–${duration}s`, duration: 5, title: 'Clear call to action', voiceover: `Save this for your next ${topic.toLowerCase()} session, and follow for more practical breakdowns.`, visual: 'Return to camera; gesture toward the save/follow prompt.', camera: 'Medium close-up, locked-off', overlay: 'SAVE THIS FOR LATER', edit: 'Hold final frame long enough to read; end cleanly', audio: 'Resolve music; no sound effect over CTA' }
  ];
  return {
    title: `${topic}: a ${duration}-second ${platform} video`,
    creative_direction: `A ${tone.toLowerCase()} ${niche.toLowerCase()} video for ${audience.toLowerCase()}. Lead with tension, show one practical insight, then close with a single CTA.`,
    hooks,
    script: shots.map(s => ({ time: s.time, voiceover: s.voiceover, delivery: s.title === 'Pattern interrupt' ? 'Fast, confident, direct' : 'Clear and natural' })),
    shots,
    captions: {
      short: `${topic} gets easier when you focus on what actually works. Save this for later.`,
      engaging: `A small shift can make a big difference with ${topic.toLowerCase()}. Try the approach in this video and tell me what changes. 👇`,
      hashtags: [`#${topic.replace(/[^a-z0-9]/gi, '')}`, '#ContentCreator', '#CreatorTips', '#ReelsTips', '#LearnOnInstagram']
    },
    production_notes: [
      'Shoot vertically in 9:16 and keep the subject inside the center-safe area.',
      'Add burned-in captions; emphasize key words.',
      'Use licensed music and check platform audio rules before publishing.',
      'Keep the CTA to one action.'
    ],
    metadata: { platform, duration, niche, audience, tone, mode: 'demo', provider: 'gemini' }
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parseRetryDelayMs = (err: unknown): number | null => {
  try {
    const msg = err instanceof Error ? err.message : String(err);
    const match = msg.match(/retryDelay["']?\s*:\s*["']?([0-9.]+)(s|ms)?/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase() || 's';
      return unit === 'ms' ? val : Math.round(val * 1000);
    }
  } catch {
    // ignore
  }
  return null;
};

const isQuotaExhaustedError = (msg: string): boolean => {
  const lower = (msg || '').toLowerCase();
  return (
    lower.includes('quota exceeded') ||
    lower.includes('resource_exhausted') ||
    lower.includes('limit: 20') ||
    lower.includes('free_tier_requests')
  );
};

const isModelNotFoundError = (msg: string): boolean => {
  const lower = (msg || '').toLowerCase();
  return (
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('no longer available')
  );
};

const isAuthError = (msg: string): boolean => {
  const lower = (msg || '').toLowerCase();
  return (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('permission_denied')
  );
};

const isTransientServerError = (msg: string): boolean => {
  const lower = (msg || '').toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('busy') ||
    lower.includes('fetch failed') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout')
  );
};

export async function generateProductionKit(input: Partial<ReelBriefForm> & { selectedHook?: string }): Promise<ProductionKit> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are ReelForge, an expert short-form video strategist, scriptwriter, and editor. Return ONLY valid JSON with keys title, creative_direction, hooks (exactly 3 objects with text and angle), script (array of time, voiceover, delivery), shots (array of time, duration number, title, voiceover, visual, camera, overlay, edit, audio), captions (short, engaging, hashtags array), production_notes (array), metadata (object). Create practical, specific, shootable content. Align script and shot timestamps and keep total video close to requested duration. Include camera framing, visual action, on-screen text, edit notes, audio cues. Avoid invented statistics. Tailor to this brief: ${JSON.stringify(input)}. ${input.selectedHook ? `Use this exact line as the opening hook and build the whole script/storyboard around its promise: ${JSON.stringify(input.selectedHook)}` : ''}`;

  // Priority order:
  // 1. Explicitly configured GEMINI_MODEL (if set)
  // 2. High-availability, low-latency verified models (gemini-3.5-flash-lite, gemini-flash-lite-latest)
  // 3. Robust fallbacks (gemini-3.1-flash-lite, gemini-3.1-flash-lite-preview)
  // 4. Standard flash models (gemini-3.5-flash, gemini-3.7-flash, gemini-3.8-flash)
  const candidateModels = Array.from(new Set([
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash'
  ])).filter(Boolean) as string[];

  let textResponse: string | null = null;
  let usedModel: string | undefined = undefined;
  let lastErrorMsg = '';
  const startTime = Date.now();
  const MAX_TOTAL_EXECUTION_MS = 24000; // Keep total execution safely under Vercel serverless function timeout

  for (const modelName of candidateModels) {
    const elapsed = Date.now() - startTime;
    if (elapsed > MAX_TOTAL_EXECUTION_MS) {
      console.warn(`[generateProductionKit] Approaching serverless function timeout (${elapsed}ms). Aborting candidate loop.`);
      break;
    }

    console.log(`[generateProductionKit] Attempting candidate model: ${modelName} (elapsed: ${elapsed}ms)`);
    // Allow at most 1 fast retry for transient 503/network spikes
    const maxAttemptsForModel = 2;

    for (let attempt = 0; attempt < maxAttemptsForModel; attempt++) {
      try {
        if (attempt > 0) {
          const jitter = Math.floor(Math.random() * 200);
          const delay = 350 + jitter;
          console.log(`[generateProductionKit] Fast retry ${attempt + 1}/${maxAttemptsForModel} for model ${modelName} after ${delay}ms...`);
          await sleep(delay);
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.7 }
        });

        if (response.text) {
          textResponse = response.text;
          usedModel = modelName;
          console.log(`[generateProductionKit] SUCCESS with model ${modelName} on attempt ${attempt + 1}. Response length: ${response.text.length}`);
          break;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastErrorMsg = msg;

        // 1. Authentication errors cannot be resolved by retrying or switching models
        if (isAuthError(msg)) {
          console.error(`[generateProductionKit] Fatal authentication error on model ${modelName}:`, msg.slice(0, 150));
          throw new Error('Gemini API authentication failed. Please verify your GEMINI_API_KEY.');
        }

        // 2. Model 404 or deprecated -> Skip immediately to next model
        if (isModelNotFoundError(msg)) {
          console.warn(`[generateProductionKit] Model ${modelName} not available or deprecated. Skipping immediately.`);
          break;
        }

        // 3. Quota exhausted on this model -> Skip immediately to next candidate model
        if (isQuotaExhaustedError(msg)) {
          console.warn(`[generateProductionKit] Quota exhausted for model ${modelName}. Switching immediately to fallback model.`);
          break;
        }

        // 4. Temporary 503 or transient network error
        if (isTransientServerError(msg)) {
          const retryDelay = parseRetryDelayMs(err);
          // If the upstream advises waiting longer than 2.5s, don't stall the serverless function; fallback immediately
          if (retryDelay && retryDelay > 2500) {
            console.warn(`[generateProductionKit] Upstream requested long retry delay (${retryDelay}ms) on ${modelName}. Switching to fallback model immediately.`);
            break;
          }

          console.warn(`[generateProductionKit] Model ${modelName} attempt ${attempt + 1} experienced transient spike:`, msg.slice(0, 150));
          // If first attempt, loop will perform fast retry; if second attempt failed, break to next model
          continue;
        }

        // Any other error -> log and try next model
        console.warn(`[generateProductionKit] Model ${modelName} attempt ${attempt + 1} failed:`, msg.slice(0, 150));
        break;
      }
    }

    if (textResponse) {
      break;
    }
  }

  if (!textResponse) {
    throw new Error(lastErrorMsg || 'All Gemini AI model generation attempts failed.');
  }

  let cleaned = textResponse.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    const data = JSON.parse(cleaned) as ProductionKit;
    data.metadata = { ...(data.metadata || {}), mode: 'ai', provider: 'gemini', model: usedModel };
    return data;
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON response:', parseErr, 'Raw:', cleaned.slice(0, 200));
    throw new Error('Received malformed JSON structure from Gemini AI.');
  }
}
