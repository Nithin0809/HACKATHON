import { GoogleGenAI } from '@google/genai';

function sample(input) {
  const topic = input.topic || 'Build better habits';
  const niche = input.niche || 'Creator education';
  const audience = input.audience || 'Beginners';
  const platform = input.platform || 'Instagram Reels';
  const tone = input.tone || 'Conversational';
  const duration = Number(input.duration || 30);
  const hooks = [
    `You're probably approaching ${topic.toLowerCase()} all wrong.`,
    `Nobody tells beginners this about ${topic.toLowerCase()}.`,
    `Stop scrolling if you want to get better at ${topic.toLowerCase()}.`
  ];
  const opening = input.selectedHook?.trim() || hooks[0];
  const shots = [
    {time:'0–3s',duration:3,title:'Pattern interrupt',voiceover:opening,visual:'Start on a tight close-up; look directly into the lens.',camera:'Tight close-up, subtle push-in',overlay:"YOU'RE DOING THIS WRONG",edit:'Hard cut on first word; punch-in at 1.5s',audio:'Short impact hit, then music bed'},
    {time:'3–9s',duration:6,title:'Make the problem relatable',voiceover:`Most people in ${audience.toLowerCase()} focus on the obvious part of ${topic.toLowerCase()} and miss what actually moves the needle.`,visual:'Show the common mistake, process, or before-state as B-roll.',camera:'Over-the-shoulder / medium shot',overlay:'THE COMMON MISTAKE',edit:'Three quick cuts; highlight one keyword per beat',audio:'Light whoosh between cuts'},
    {time:'9–18s',duration:9,title:'Deliver the useful insight',voiceover:'Instead, simplify it: pick one clear goal, make the next step obvious, and repeat what works.',visual:'Demonstrate the better approach on screen; show the result, not just the explanation.',camera:'Screen recording + hands-on detail shot',overlay:'ONE GOAL → ONE NEXT STEP',edit:'Cut to demonstration; use a speed ramp only if it adds clarity',audio:'Music builds slightly under the reveal'},
    {time:'18–25s',duration:7,title:'Show proof or an example',voiceover:'Try this once today and compare the result with your usual approach.',visual:'Show a concrete example, a before/after, or a quick checklist.',camera:'Medium shot followed by detail insert',overlay:'TRY THIS TODAY',edit:'Use a clean match cut into the example',audio:'Soft click / confirmation sound'},
    {time:`${Math.max(25,duration-5)}–${duration}s`,duration:5,title:'Clear call to action',voiceover:`Save this for your next ${topic.toLowerCase()} session, and follow for more practical breakdowns.`,visual:'Return to camera; gesture toward the save/follow prompt.',camera:'Medium close-up, locked-off',overlay:'SAVE THIS FOR LATER',edit:'Hold final frame long enough to read; end cleanly',audio:'Resolve music; no sound effect over CTA'}
  ];
  return {
    title:`${topic}: a ${duration}-second ${platform} video`,
    creative_direction:`A ${tone.toLowerCase()} ${niche.toLowerCase()} video for ${audience.toLowerCase()}. Lead with tension, show one practical insight, then close with a single CTA.`,
    hooks:hooks.map((text,i)=>({text,angle:['Curiosity / challenge','Insider insight','Direct call-out'][i]})),
    script:shots.map(s=>({time:s.time,voiceover:s.voiceover,delivery:s.title==='Pattern interrupt'?'Fast, confident, direct':'Clear and natural'})),
    shots,
    captions:{short:`${topic} gets easier when you focus on what actually works. Save this for later.`,engaging:`A small shift can make a big difference with ${topic.toLowerCase()}. Try the approach in this video and tell me what changes. 👇`,hashtags:[`#${topic.replace(/[^a-z0-9]/gi,'')}`,'#ContentCreator','#CreatorTips','#ReelsTips','#LearnOnInstagram']},
    production_notes:['Shoot vertically in 9:16 and keep the subject inside the center-safe area.','Add burned-in captions; emphasize key words.','Use licensed music and check platform audio rules before publishing.','Keep the CTA to one action.'],
    metadata:{platform,duration,niche,audience,tone,mode:'demo',provider:'gemini'}
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed. Use POST.'});
  const input = req.body || {};
  if (!input.topic?.trim()) return res.status(400).json({error:'Please enter a video topic.'});
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(200).json(sample(input));
    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    const prompt = `You are ReelForge, an expert short-form video strategist, scriptwriter, and editor. Return ONLY valid JSON with keys title, creative_direction, hooks (exactly 3 objects with text and angle), script (array of time, voiceover, delivery), shots (array of time, duration number, title, voiceover, visual, camera, overlay, edit, audio), captions (short, engaging, hashtags array), production_notes (array), metadata (object). Create practical, specific, shootable content. Align script and shot timestamps and keep total video close to requested duration. Include camera framing, visual action, on-screen text, edit notes, audio cues. Avoid invented statistics. Tailor to this brief: ${JSON.stringify(input)}. ${input.selectedHook ? `Use this exact line as the opening hook and build the whole script/storyboard around its promise: ${JSON.stringify(input.selectedHook)}` : ''}`;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType:'application/json', temperature:0.8 }
    });
    if (!response.text) throw new Error('Gemini returned an empty response.');
    let cleaned = response.text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const data = JSON.parse(cleaned);
    data.metadata = {...(data.metadata || {}), mode:'ai', provider:'gemini'};
    return res.status(200).json(data);
  } catch (err) {
    console.error('Vercel Gemini function error:', err?.status || '', err?.message || err);
    return res.status(502).json({error:'Gemini generation failed. Check the Vercel environment variables, model access, and API quota.', detail:process.env.NODE_ENV === 'development' ? (err?.message || String(err)) : undefined});
  }
}
