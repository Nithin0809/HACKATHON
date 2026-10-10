import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({
    ok: true,
    mode: hasKey ? 'ai' : 'demo',
    provider: hasKey ? 'gemini' : 'demo'
  });
}
