import { NextResponse } from 'next/server';
import { generateProductionKit, getSampleKit } from '@/lib/gemini';
import { normalizeResult } from '@/lib/normalizer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const input = await request.json().catch(() => ({}));
    if (!input.topic || typeof input.topic !== 'string' || !input.topic.trim()) {
      return NextResponse.json({ error: 'Please enter a video topic.' }, { status: 400 });
    }

    const rawKit = await generateProductionKit(input);
    const normalized = normalizeResult(rawKit);

    if (!normalized) {
      const fallback = normalizeResult(getSampleKit(input));
      return NextResponse.json(fallback);
    }

    return NextResponse.json(normalized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('App Router /api/generate error:', msg);
    const fallback = normalizeResult(getSampleKit({}));
    return NextResponse.json(fallback);
  }
}
