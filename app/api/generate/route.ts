import { NextResponse } from 'next/server';
import { generateProductionKit, getSampleKit } from '@/lib/gemini';
import { normalizeResult } from '@/lib/normalizer';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const input = await request.json().catch(() => ({}));
    if (!input.topic || typeof input.topic !== 'string' || !input.topic.trim()) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Please enter a video topic.' } },
        { status: 400 }
      );
    }

    console.log(`[POST /api/generate] Request received for topic: "${input.topic.slice(0, 60)}"`);

    const rawKit = await generateProductionKit(input);
    const normalized = normalizeResult(rawKit);

    if (!normalized) {
      console.error('[POST /api/generate] Failed to normalize production kit output.');
      return NextResponse.json(
        { error: { code: 'NORMALIZATION_FAILED', message: 'Could not structure the generated video plan. Please try again.' } },
        { status: 500 }
      );
    }

    console.log(`[POST /api/generate] SUCCESS: Generated plan "${normalized.title}" with ${(normalized.shots || []).length} scenes.`);
    return NextResponse.json(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/generate] Server Error:', msg);

    const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
    const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('busy') || msg.includes('overloaded');
    const isApiKeyMissing = msg.includes('GEMINI_API_KEY');

    let userFacingMsg = msg;
    let errorCode = 'GEMINI_API_ERROR';
    let statusCode = 500;

    if (isApiKeyMissing) {
      userFacingMsg = 'GEMINI_API_KEY is not configured in environment variables.';
      errorCode = 'MISSING_API_KEY';
    } else if (is503 || isQuota) {
      userFacingMsg = 'Our AI service is busy right now. Please try again in a moment.';
      errorCode = is503 ? 'SERVICE_UNAVAILABLE' : 'GEMINI_QUOTA_EXCEEDED';
      statusCode = is503 ? 503 : 429;
    }

    return NextResponse.json(
      {
        error: {
          code: errorCode,
          message: userFacingMsg
        }
      },
      { status: statusCode }
    );
  }
}
