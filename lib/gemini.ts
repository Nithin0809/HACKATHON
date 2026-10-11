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

const isRetryableError = (msg: string): boolean => {
  const lower = (msg || '').toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit') ||
    lower.includes('quota') ||
    lower.includes('429') ||
    lower.includes('overloaded') ||
    lower.includes('busy') ||
    lower.includes('fetch failed') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout')
  );
};

const getBackoffDelay = (attempt: number): number => {
  const baseMs = 500 * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms
  const jitterMs = Math.floor(Math.random() * 300); // 0-300ms random jitter
  return Math.min(baseMs + jitterMs, 5000);
};

export async function generateProductionKit(input: Partial<ReelBriefForm> & { selectedHook?: string }): Promise<ProductionKit> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are ReelForge, an expert short-form video strategist, scriptwriter, and editor. Return ONLY valid JSON with keys title, creative_direction, hooks (exactly 3 objects with text and angle), script (array of time, voiceover, delivery), shots (array of time, duration number, title, voiceover, visual, camera, overlay, edit, audio), captions (short, engaging, hashtags array), production_notes (array), metadata (object). Create practical, specific, shootable content. Align script and shot timestamps and keep total video close to requested duration. Include camera framing, visual action, on-screen text, edit notes, audio cues. Avoid invented statistics. Tailor to this brief: ${JSON.stringify(input)}. ${input.selectedHook ? `Use this exact line as the opening hook and build the whole script/storyboard around its promise: ${JSON.stringify(input.selectedHook)}` : ''}`;

  const candidateModels = Array.from(new Set([
    process.env.GEMINI_MODEL,
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.5-flash'
  ])).filter(Boolean) as string[];

  let textResponse: string | null = null;
  let usedModel: string | undefined = undefined;
  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    console.log(`[generateProductionKit] Candidate model: ${modelName}`);
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          const delay = getBackoffDelay(attempt - 1);
          console.log(`[generateProductionKit] Retry ${attempt + 1}/${maxAttempts} for model ${modelName} after ${delay}ms backoff...`);
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
        const retryable = isRetryableError(msg);
        console.warn(`[generateProductionKit] Model ${modelName} attempt ${attempt + 1} failed (retryable: ${retryable}):`, msg.slice(0, 150));

        if (!retryable) {
          // Do not retry authentication error (401, 403) or invalid requests (400, 404)
          break;
        }
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
