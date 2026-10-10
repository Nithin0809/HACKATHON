import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

function getDimensions(aspectRatio: string): { width: number; height: number; aspectClass: string } {
  if (aspectRatio === '16:9') {
    return { width: 1280, height: 720, aspectClass: '16/9' };
  }
  if (aspectRatio === '1:1') {
    return { width: 800, height: 800, aspectClass: '1/1' };
  }
  return { width: 720, height: 1280, aspectClass: '9/16' };
}

function renderHighDefCinematicSVG(params: {
  sceneNum: number;
  totalScenes: number;
  time: string;
  title: string;
  visual: string;
  camera: string;
  overlay: string;
  topic: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
}): string {
  const { sceneNum, time, title, visual, camera, overlay, platform, width, height, aspectRatio } = params;

  const hues = [
    { start: '#1e1b4b', end: '#31103f', accent: '#a78bfa', glow: '#c4b5fd' },
    { start: '#06202b', end: '#0f3843', accent: '#38bdf8', glow: '#7dd3fc' },
    { start: '#2c1203', end: '#451a03', accent: '#ff9b68', glow: '#fdba74' },
    { start: '#042f2e', end: '#114e4e', accent: '#34d399', glow: '#6ee7b7' },
    { start: '#3b0764', end: '#1e1b4b', accent: '#f472b6', glow: '#fbcfe8' },
  ];
  const theme = hues[(sceneNum - 1) % hues.length];

  const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const safeTitle = escapeXml(title || `Shot ${sceneNum}`);
  const safeVisual = escapeXml(visual || 'Cinematic shot breakdown');
  const safeCamera = escapeXml(camera || 'Medium shot');
  const safeOverlay = escapeXml(overlay || '');
  const safePlatform = escapeXml(platform || 'Instagram Reels');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.start}"/>
      <stop offset="100%" stop-color="${theme.end}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="50%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
    </radialGradient>
    <linearGradient id="overlayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="rgba(9,9,14,0.95)"/>
      <stop offset="50%" stop-color="rgba(9,9,14,0.65)"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Rule of Thirds Camera Grid -->
  <line x1="${width * 0.33}" y1="0" x2="${width * 0.33}" y2="${height}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="${width * 0.66}" y1="0" x2="${width * 0.66}" y2="${height}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="0" y1="${height * 0.33}" x2="${width}" y2="${height * 0.33}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="0" y1="${height * 0.66}" x2="${width}" y2="${height * 0.66}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6,6"/>

  <!-- Center Focal Marker -->
  <circle cx="${width / 2}" cy="${height / 2 - 40}" r="${Math.min(width, height) * 0.2}" fill="none" stroke="${theme.accent}" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="${width / 2}" cy="${height / 2 - 40}" r="${Math.min(width, height) * 0.1}" fill="${theme.accent}" fill-opacity="0.12"/>
  <polygon points="${width / 2 - 12},${height / 2 - 52} ${width / 2 + 16},${height / 2 - 40} ${width / 2 - 12},${height / 2 - 28}" fill="${theme.glow}" opacity="0.8"/>

  <!-- Vignette -->
  <rect width="100%" height="100%" fill="url(#vignette)" />

  <!-- Top Camera Status Bar -->
  <rect x="0" y="0" width="${width}" height="64" fill="rgba(0,0,0,0.65)" />
  <text x="24" y="40" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="14" font-weight="700" letter-spacing="1">● REC</text>
  <text x="${width / 2}" y="40" fill="${theme.glow}" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="600" text-anchor="middle">${safePlatform.toUpperCase()} [${aspectRatio}]</text>
  <text x="${width - 24}" y="40" fill="rgba(255,255,255,0.7)" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="600" text-anchor="end">${escapeXml(time || '0s')}</text>

  <!-- Bottom Details Overlay Card -->
  <rect x="0" y="${height * 0.5}" width="${width}" height="${height * 0.5}" fill="url(#overlayGrad)"/>

  <!-- Badges Row: Clean non-overlapping alignment -->
  <g transform="translate(24, ${height - 210})">
    <!-- Frame Badge -->
    <rect x="0" y="0" width="84" height="26" rx="6" fill="${theme.accent}" />
    <text x="42" y="17" fill="#09090e" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="800" text-anchor="middle">FRAME ${String(sceneNum).padStart(2, '0')}</text>

    <!-- Camera Framing Badge -->
    <rect x="96" y="0" width="${Math.min(width - 145, 360)}" height="26" rx="6" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
    <text x="106" y="17" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="600" text-anchor="start">${safeCamera.toUpperCase().slice(0, 42)}</text>
  </g>

  <!-- Title & Description -->
  <text x="24" y="${height - 150}" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="20" font-weight="700">${safeTitle}</text>
  <text x="24" y="${height - 120}" fill="rgba(255,255,255,0.85)" font-family="DM Sans, sans-serif" font-size="13" font-weight="400">${safeVisual.slice(0, 80)}${safeVisual.length > 80 ? '...' : ''}</text>

  <!-- On-Screen Text Overlay Banner (if present) -->
  ${safeOverlay ? `
  <g transform="translate(24, ${height - 80})">
    <rect x="0" y="0" width="${width - 48}" height="38" rx="8" fill="rgba(0,0,0,0.85)" stroke="${theme.accent}" stroke-width="1.5"/>
    <text x="${(width - 48) / 2}" y="24" fill="${theme.glow}" font-family="Space Grotesk, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">TEXT: "${safeOverlay}"</text>
  </g>
  ` : ''}

</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { shot, topic, platform, niche, sceneIndex = 1, totalScenes = 5 } = body;

    if (!shot || typeof shot !== 'object') {
      return NextResponse.json({ error: 'Missing scene shot details.' }, { status: 400 });
    }

    const platformName = (platform || 'Instagram Reels').toLowerCase();
    let aspectRatio: '9:16' | '16:9' | '1:1' = '9:16';
    let width = 720;
    let height = 1280;

    if (platformName.includes('youtube') && !platformName.includes('shorts')) {
      aspectRatio = '16:9';
      width = 1280;
      height = 720;
    } else if (platformName.includes('linkedin') || platformName.includes('square')) {
      aspectRatio = '1:1';
      width = 800;
      height = 800;
    }

    // ── Build an action-specific image prompt ──────────────────────────
    // VISUAL ACTION is the PRIMARY source for what the image must depict.
    // Title, topic, and camera are supporting context only.
    const visualAction = (shot.visual || '').trim();
    const cameraFraming = (shot.camera || 'medium shot').trim();
    const sceneTitle = (shot.title || '').trim();
    const sceneTopic = (topic || 'creator content').trim();
    const sceneNiche = (niche || '').trim();

    if (!visualAction) {
      console.warn(`Scene ${sceneIndex}: No VISUAL ACTION provided, falling back to title.`);
    }

    // Construct a prompt that leads with the exact physical action
    function buildActionPrompt(): string {
      const parts: string[] = [];

      // 1. VISUAL ACTION is the lead — what is physically happening
      if (visualAction) {
        parts.push(`Photorealistic scene: ${visualAction}`);
      } else if (sceneTitle) {
        parts.push(`Photorealistic scene depicting: ${sceneTitle}`);
      } else {
        parts.push(`Photorealistic video production scene`);
      }

      // 2. Camera framing as a cinematography instruction
      parts.push(`Shot type: ${cameraFraming}`);

      // 3. Topic/niche for environmental context only
      if (sceneTopic) {
        parts.push(`Context: ${sceneTopic}`);
      }
      if (sceneNiche) {
        parts.push(`Setting: ${sceneNiche} environment`);
      }

      // 4. Technical quality directives
      parts.push('Professional cinematic lighting, natural color grading, shallow depth of field, high detail, 8K resolution');

      // 5. Negative guidance — prevent generic stock imagery
      parts.push('Show the specific physical action and body language described, not a generic portrait or stock photo');

      return parts.join('. ') + '.';
    }

    const actionPrompt = buildActionPrompt();
    console.log(`[generate-image] Scene ${sceneIndex}/${totalScenes} prompt:`, actionPrompt.slice(0, 200));

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Provider 1: Google Gemini Imagen API ──────────────────────────
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });

      // Attempt Imagen image generation if quota/permissions allow
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: actionPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio
          }
        });
        const imgBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (imgBytes) {
          return NextResponse.json({
            ok: true,
            imageUrl: `data:image/jpeg;base64,${imgBytes}`,
            aspectRatio,
            provider: 'gemini-imagen'
          });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`Gemini Imagen call skipped:`, msg.slice(0, 120));
      }
    }

    // ── Provider 2: Pollinations AI — action-specific prompt ─────────
    try {
      // Build a clean, action-dense Pollinations prompt from VISUAL ACTION
      const cleanAction = (visualAction || sceneTitle || 'Cinematic scene')
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const cleanCamera = cameraFraming
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Construct a clean, focused visual action prompt
      const pollinationsPrompt = `${cleanAction} ${cleanCamera} cinematic photorealistic high detail 8k`.slice(0, 240);
      const encodedPrompt = encodeURIComponent(pollinationsPrompt);
      const seed = Math.abs(
        (visualAction || sceneTitle || 'reelforge').split('').reduce(
          (a: number, b: string) => (a << 5) - a + b.charCodeAt(0), 0
        )
      ) + sceneIndex;

      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(pollinationsUrl, { 
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok && res.status === 200) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('image')) {
          const arrayBuf = await res.arrayBuffer();
          if (arrayBuf.byteLength > 2000) {
            const base64Img = Buffer.from(arrayBuf).toString('base64');
            return NextResponse.json({
              ok: true,
              imageUrl: `data:image/jpeg;base64,${base64Img}`,
              aspectRatio,
              provider: 'pollinations-ai'
            });
          }
        }
      }
    } catch (pollErr: unknown) {
      const msg = pollErr instanceof Error ? pollErr.message : String(pollErr);
      console.warn('Pollinations AI image generation skipped:', msg);
    }

    // ── Provider 3: Fail-Safe Cinematic SVG Renderer ─────────────────
    const fallbackUrl = renderHighDefCinematicSVG({
      sceneNum: Number(sceneIndex),
      totalScenes: Number(totalScenes),
      time: shot.time || `${(sceneIndex - 1) * 5}s`,
      title: shot.title || `Shot ${sceneIndex}`,
      visual: shot.visual || 'Visual scene representation',
      camera: shot.camera || 'Medium shot',
      overlay: shot.overlay || '',
      topic: topic || 'ReelForge Studio',
      platform: platform || 'Instagram Reels',
      width,
      height,
      aspectRatio
    });

    return NextResponse.json({
      ok: true,
      imageUrl: fallbackUrl,
      aspectRatio,
      provider: 'cinematic-renderer'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('App Router /api/generate-image error:', msg);
    return NextResponse.json({ error: 'Failed to generate visual storyboard image.', detail: msg }, { status: 500 });
  }
}
