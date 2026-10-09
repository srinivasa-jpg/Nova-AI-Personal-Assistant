/**
 * Vercel serverless function. OpenAI credentials stay on the server.
 * Without OPENAI_API_KEY, the dashboard uses clearly labeled local demo responses.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({ enabled: Boolean(process.env.OPENAI_API_KEY) });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI is not configured. Add OPENAI_API_KEY in Vercel settings.' });
  }
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const safeMessages = messages.slice(-12).filter((m) => (
    (m?.role === 'user' || m?.role === 'assistant') &&
    typeof m.content === 'string' && m.content.length <= 2500
  ));
  if (!safeMessages.length || safeMessages.at(-1)?.role !== 'user') {
    return res.status(400).json({ error: 'Send a user message.' });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          max_tokens: 480,
          temperature: 0.6,
          messages: [
            { role: 'system', content: 'You are SRINIVAS AI, a warm, concise personal productivity assistant. Offer practical time management, organization and study/teaching advice. Keep most responses under 130 words. Do not claim to create real reminders or change task data; the UI handles those actions. Never request private access tokens or passwords.' },
            ...safeMessages
          ]
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }
    const body = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'AI provider is unavailable. Try again later.' });
    const reply = body?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return res.status(502).json({ error: 'Empty AI response.' });
    return res.status(200).json({ reply: reply.slice(0, 4000) });
  } catch (error) {
    return res.status(502).json({ error: error?.name === 'AbortError' ? 'AI response timed out.' : 'Unable to reach AI provider.' });
  }
}
