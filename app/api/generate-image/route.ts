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
  const { sceneNum, totalScenes, time, title, visual, camera, overlay, topic, platform, width, height, aspectRatio } = params;

  // Curated color themes based on scene index for visual consistency
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
  const safeTopic = escapeXml(topic || 'Creator Reel');
  const safePlatform = escapeXml(platform || 'Instagram Reels');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.start}"/>
      <stop offset="100%" stop-color="${theme.end}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="60%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
    </radialGradient>
    <linearGradient id="overlayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.95)"/>
      <stop offset="40%" stop-color="rgba(0,0,0,0.6)"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Lines for Camera Framing Rule of Thirds -->
  <line x1="${width * 0.33}" y1="0" x2="${width * 0.33}" y2="${height}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="${width * 0.66}" y1="0" x2="${width * 0.66}" y2="${height}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="0" y1="${height * 0.33}" x2="${width}" y2="${height * 0.33}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6,6"/>
  <line x1="0" y1="${height * 0.66}" x2="${width}" y2="${height * 0.66}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6,6"/>

  <!-- Center Subject Mockup / Camera Reticle -->
  <circle cx="${width / 2}" cy="${height / 2 - 30}" r="${Math.min(width, height) * 0.22}" fill="none" stroke="${theme.accent}" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="${width / 2}" cy="${height / 2 - 30}" r="${Math.min(width, height) * 0.12}" fill="${theme.accent}" fill-opacity="0.12"/>
  <polygon points="${width / 2 - 15},${height / 2 - 45} ${width / 2 + 20},${height / 2 - 30} ${width / 2 - 15},${height / 2 - 15}" fill="${theme.glow}" opacity="0.8"/>

  <!-- Vignette -->
  <rect width="100%" height="100%" fill="url(#vignette)" />

  <!-- Top Camera Status Bar -->
  <rect x="0" y="0" width="${width}" height="60" fill="rgba(0,0,0,0.6)" />
  <text x="24" y="38" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="14" font-weight="700" letter-spacing="1">● REC</text>
  <text x="${width / 2}" y="38" fill="${theme.glow}" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="600" text-anchor="middle">${safePlatform.toUpperCase()} [${aspectRatio}]</text>
  <text x="${width - 24}" y="38" fill="rgba(255,255,255,0.7)" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="600" text-anchor="end">${escapeXml(time || '0s')}</text>

  <!-- Bottom Details Overlay Card -->
  <rect x="0" y="${height * 0.55}" width="${width}" height="${height * 0.45}" fill="url(#overlayGrad)"/>

  <!-- Shot Number Badge -->
  <rect x="24" y="${height - 180}" width="90" height="28" rx="6" fill="${theme.accent}" opacity="0.9"/>
  <text x="69" y="${height - 161}" fill="#09090e" font-family="Space Grotesk, sans-serif" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1">FRAME 0${sceneNum}</text>

  <!-- Camera Framing Badge -->
  <rect x="124" y="${height - 180}" width="140" height="28" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="194" y="${height - 161}" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="600" text-anchor="middle">${safeCamera.toUpperCase()}</text>

  <!-- Title & Description -->
  <text x="24" y="${height - 126}" fill="#ffffff" font-family="Space Grotesk, sans-serif" font-size="20" font-weight="700">${safeTitle}</text>
  <text x="24" y="${height - 96}" fill="rgba(255,255,255,0.85)" font-family="DM Sans, sans-serif" font-size="13" font-weight="400">${safeVisual.slice(0, 75)}${safeVisual.length > 75 ? '...' : ''}</text>

  <!-- On-Screen Text Overlay Banner (if present) -->
  ${safeOverlay ? `
  <rect x="24" y="${height - 64}" width="${width - 48}" height="38" rx="8" fill="rgba(0,0,0,0.85)" stroke="${theme.accent}" stroke-width="1.5"/>
  <text x="${width / 2}" y="${height - 40}" fill="${theme.glow}" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="0.5">TEXT: "${safeOverlay}"</text>
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
    if (platformName.includes('youtube') && !platformName.includes('shorts')) {
      aspectRatio = '16:9';
    } else if (platformName.includes('linkedin') || platformName.includes('square')) {
      aspectRatio = '1:1';
    }

    const dims = getDimensions(aspectRatio);

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Cinematic storyboard frame for video shot ${sceneIndex} of ${totalScenes}. Topic: "${topic || 'Creator video'}". Platform: ${platform} (${aspectRatio} aspect ratio). Scene Title: "${shot.title}". Visual Action: "${shot.visual}". Camera framing: "${shot.camera}". Color grading: vibrant cinematic lighting, shallow depth of field, professional studio setting.`;

      // Try image generation models if permitted on API key
      const candidateImageModels = [
        'imagen-3.0-generate-002',
        'gemini-2.5-flash-image',
        'gemini-3.1-flash-image'
      ];

      for (const mName of candidateImageModels) {
        try {
          const response = await ai.models.generateImages({
            model: mName,
            prompt,
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
          console.warn(`Image model ${mName} call skipped:`, msg.slice(0, 120));
        }
      }
    }

    // High-definition cinematic SVG visual frame fallback
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
      width: dims.width,
      height: dims.height,
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
