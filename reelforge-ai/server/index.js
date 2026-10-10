import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const port = process.env.PORT || 8787;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Resolve which AI provider to use: Gemini first, then OpenAI, then demo
const aiProvider = process.env.GEMINI_API_KEY
  ? { name: 'gemini', apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' }
  : process.env.OPENAI_API_KEY
    ? { name: 'openai', apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4o-mini', baseURL: undefined }
    : null;

const sample = (input) => {
  const topic = input.topic || 'Build better habits';
  const niche = input.niche || 'Creator education';
  const audience = input.audience || 'Beginners';
  const platform = input.platform || 'Instagram Reels';
  const tone = input.tone || 'Conversational';
  const duration = Number(input.duration || 30);
  const hookOptions = [
    `You're probably approaching ${topic.toLowerCase()} all wrong.`,
    `Nobody tells beginners this about ${topic.toLowerCase()}.`,
    `Stop scrolling if you want to get better at ${topic.toLowerCase()}.`
  ];
  const selectedHook = input.selectedHook?.trim() || hookOptions[0];
  const shots = [
    { time: '0–3s', duration: 3, title: 'Pattern interrupt', voiceover: selectedHook, visual: 'Start on a tight close-up; look directly into the lens.', camera: 'Tight close-up, subtle push-in', overlay: 'YOU’RE DOING THIS WRONG', edit: 'Hard cut on first word; punch-in at 1.5s', audio: 'Short impact hit, then music bed' },
    { time: '3–9s', duration: 6, title: 'Make the problem relatable', voiceover: `Most people in ${audience.toLowerCase()} focus on the obvious part of ${topic.toLowerCase()} and miss what actually moves the needle.`, visual: 'Show the common mistake, process, or before-state as B-roll.', camera: 'Over-the-shoulder / medium shot', overlay: 'THE COMMON MISTAKE', edit: 'Three quick cuts; highlight one keyword per beat', audio: 'Light whoosh between cuts' },
    { time: '9–18s', duration: 9, title: 'Deliver the useful insight', voiceover: `Instead, simplify it: pick one clear goal, make the next step obvious, and repeat what works.`, visual: 'Demonstrate the better approach on screen; show the result, not just the explanation.', camera: 'Screen recording + hands-on detail shot', overlay: 'ONE GOAL → ONE NEXT STEP', edit: 'Cut to demonstration; use a brief speed ramp only if it adds clarity', audio: 'Music builds slightly under the reveal' },
    { time: '18–25s', duration: 7, title: 'Show proof or an example', voiceover: `For example, try this once today and compare the result with your usual approach.`, visual: 'Show a concrete example, a before/after, or a quick checklist.', camera: 'Medium shot followed by detail insert', overlay: 'TRY THIS TODAY', edit: 'Use a clean match cut into the example', audio: 'Soft click / confirmation sound' },
    { time: `${Math.max(25, duration-5)}–${duration}s`, duration: 5, title: 'Clear call to action', voiceover: `Save this for your next ${topic.toLowerCase()} session, and follow for more practical breakdowns.`, visual: 'Return to camera; gesture toward the save/follow prompt.', camera: 'Medium close-up, locked-off', overlay: 'SAVE THIS FOR LATER', edit: 'Hold final frame long enough to read; end cleanly', audio: 'Resolve music; no sound effect over CTA' }
  ];
  return {
    title: `${topic}: a ${duration}-second ${platform} video`,
    creative_direction: `A ${tone.toLowerCase()} ${niche.toLowerCase()} video for ${audience.toLowerCase()}. Lead with tension, show one practical insight, then close with a single CTA.`,
    hooks: hookOptions.map((text, i) => ({ text, angle: ['Curiosity / challenge', 'Insider insight', 'Direct call-out'][i] })),
    script: shots.map(s => ({ time: s.time, voiceover: s.voiceover, delivery: s.title === 'Pattern interrupt' ? 'Fast, confident, direct' : 'Clear and natural' })),
    shots: shots.map(({time,duration,title,visual,camera,overlay,edit,audio,voiceover}) => ({ time,duration,title,visual,camera,overlay,edit,audio,voiceover })),
    captions: {
      short: `${topic} gets easier when you focus on what actually works. Save this for later.`,
      engaging: `A small shift can make a big difference with ${topic.toLowerCase()}. Try the approach in this video and tell me what changes. 👇`,
      hashtags: [`#${topic.replace(/[^a-z0-9]/gi,'')}`, '#ContentCreator', '#CreatorTips', '#ReelsTips', '#LearnOnInstagram']
    },
    production_notes: ['Shoot vertically in 9:16 and keep the subject inside the center-safe area.', 'Add burned-in captions; emphasize only key words, not every word.', 'Use licensed music and check platform audio rules before publishing.', 'Keep the CTA to one action.'],
    metadata: { platform, duration, niche, audience, tone, mode: 'demo' }
  };
};

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: aiProvider ? 'ai' : 'demo', provider: aiProvider?.name || 'demo' }));

app.post('/api/generate', async (req, res) => {
  const input = req.body || {};
  if (!input.topic?.trim()) return res.status(400).json({ error: 'Please enter a video topic.' });
  try {
    if (aiProvider) {
      const client = new OpenAI({ apiKey: aiProvider.apiKey, baseURL: aiProvider.baseURL });
      const response = await client.chat.completions.create({
        model: aiProvider.model,
        response_format: { type: 'json_object' },
        temperature: 0.8,
        messages: [
          { role: 'system', content: `You are ReelForge, an expert short-form video strategist, scriptwriter, and editor. Return only valid JSON with keys: title, creative_direction, hooks (array of {text,angle}, exactly 3), script (array of {time,voiceover,delivery}), shots (array of {time,duration,title,voiceover,visual,camera,overlay,edit,audio}), captions ({short,engaging,hashtags}), production_notes (array of strings), metadata. Create practical, shootable, non-generic content. Keep each shot aligned with script timestamps and total duration. Make claims responsibly; don't invent statistics. Tailor to platform, audience, niche, tone, and duration. If selectedHook is supplied, use it as the exact opening line and build the script/storyboard around its promise. Shot breakdown must include camera framing, visual action, on-screen text, edit notes, and audio cues.` },
          { role: 'user', content: JSON.stringify(input) }
        ]
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('The AI returned an empty response.');
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }
      return res.json(JSON.parse(cleaned));
    }
    return res.json(sample(input));
  } catch (err) {
    console.error('Generation error:', err.message);
    return res.status(502).json({ error: 'Generation failed. Check your API key/model or try again.', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
}
app.listen(port, () => console.log(`ReelForge API running at http://localhost:${port}`));
