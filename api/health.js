export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, mode: process.env.GEMINI_API_KEY ? 'ai' : 'demo', provider: 'gemini' });
}
