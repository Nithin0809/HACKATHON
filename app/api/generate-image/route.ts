import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

function getDimensions(aspectRatio: string): { width: number; height: number } {
  if (aspectRatio === '16:9') {
    return { width: 1280, height: 720 };
  }
  if (aspectRatio === '1:1') {
    return { width: 800, height: 800 };
  }
  return { width: 720, height: 1280 };
}

// Action-Dense Photorealistic Visual Engine
function selectActionPhotoUrl(visualAction: string, cameraFraming: string, width: number, height: number): string {
  const text = `${visualAction} ${cameraFraming}`.toLowerCase();

  // 1. Audio / Video Editing / Software Timeline
  if (/\b(editor|editing|audio|timeline|volume|software|premiere|cut|track|timeline|clip|levels|waveform)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=${width}&h=${height}&fit=crop`;
  }

  // 2. Frustrated Creator / Phone / Social Analytics / Engagement
  if (/\b(phone|smartphone|frustrated|engagement|disappointed|analytics|screen|frustration|scrolling|viewcount|views)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=${width}&h=${height}&fit=crop`;
  }

  // 3. Creator Speaking to Camera / Home Studio / Microphone / Talking Head
  if (/\b(camera|studio|speaking|speaks|microphone|podcast|filming|lens|setup|presenter|talking)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=${width}&h=${height}&fit=crop`;
  }

  // 4. Chef / Cooking / Kitchen / Chopping
  if (/\b(chef|cooking|chopping|pepper|food|kitchen|knife|recipe|prep|cook)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=${width}&h=${height}&fit=crop`;
  }

  // 5. Mechanic / Automotive / Car Engine
  if (/\b(mechanic|car|engine|wrench|torque|tuning|auto|garage|repair)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=${width}&h=${height}&fit=crop`;
  }

  // 6. Developer / Standup / Whiteboard / Collaboration
  if (/\b(developer|code|whiteboard|sticky|notes|standup|laptop|programming)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=${width}&h=${height}&fit=crop`;
  }

  // 7. Fitness / Workout / Gym
  if (/\b(fitness|gym|workout|exercise|training|athlete)\b/i.test(text)) {
    return `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=${width}&h=${height}&fit=crop`;
  }

  // Fallback: Professional video production camera operator
  return `https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=${width}&h=${height}&fit=crop`;
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

    const { width, height } = getDimensions(aspectRatio);

    const visualAction = (shot.visual || '').trim();
    const cameraFraming = (shot.camera || 'medium shot').trim();
    const sceneTitle = (shot.title || '').trim();
    const sceneTopic = (topic || 'creator content').trim();
    const sceneNiche = (niche || '').trim();

    // Construct prompt
    const actionPrompt = `Photorealistic scene: ${visualAction || sceneTitle}. Shot type: ${cameraFraming}. Context: ${sceneTopic}. Setting: ${sceneNiche}. High quality 8k photorealistic.`;
    console.log(`[generate-image] Scene ${sceneIndex}/${totalScenes} prompt:`, actionPrompt.slice(0, 160));

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Tier 1: Gemini Image Models ──────────────────────────────────
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const geminiImageModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

      for (const mName of geminiImageModels) {
        try {
          const res = await ai.models.generateContent({
            model: mName,
            contents: actionPrompt,
            config: {
              responseModalities: ['IMAGE']
            }
          });
          const part = res.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData?.data) {
            return NextResponse.json({
              ok: true,
              imageUrl: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`,
              aspectRatio,
              provider: 'gemini-image'
            });
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn(`Gemini image ${mName} call skipped:`, msg.slice(0, 100));
        }
      }
    }

    // ── Tier 2: Real Action-Matched Visual Engine ─────────────────────
    try {
      const photoUrl = selectActionPhotoUrl(visualAction || sceneTitle, cameraFraming, width, height);
      console.log(`[generate-image] Fetching action image: ${photoUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(photoUrl, {
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok && res.status === 200) {
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        if (contentType.includes('image')) {
          const arrayBuf = await res.arrayBuffer();
          if (arrayBuf.byteLength > 2000) {
            const base64Img = Buffer.from(arrayBuf).toString('base64');
            return NextResponse.json({
              ok: true,
              imageUrl: `data:image/jpeg;base64,${base64Img}`,
              aspectRatio,
              provider: 'reelforge-visual-engine'
            });
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Action Visual Engine image fetch failed:', msg);
    }

    // If image generation fails, return a clear 500 error so frontend displays Retry
    return NextResponse.json(
      { error: "Couldn't create this picture. Please try again." },
      { status: 500 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('App Router /api/generate-image error:', msg);
    return NextResponse.json(
      { error: "Couldn't create this picture. Please try again.", detail: msg },
      { status: 500 }
    );
  }
}
