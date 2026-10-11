export class OmniRouteError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = 'OmniRouteError';
  }
}

export type OmniRouteMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function endpointFor(baseUrl: string) {
  const base = new URL(baseUrl);
  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && localHost)) {
    throw new OmniRouteError('OmniRoute must use HTTPS except for a local development server.', 503);
  }
  if (base.username || base.password || base.search || base.hash) {
    throw new OmniRouteError('OMNIROUTE_BASE_URL must not contain credentials, a query, or a fragment.', 503);
  }

  const path = base.pathname.replace(/\/+$/, '').replace(/\/v1$/, '');
  base.pathname = `${path}/v1/chat/completions`;
  return base;
}

export async function requestOmniRoute(
  messages: OmniRouteMessage[],
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const apiKey = env.OMNIROUTE_API_KEY?.trim();
  const model = env.OMNIROUTE_MODEL?.trim();
  const baseUrl = env.OMNIROUTE_BASE_URL?.trim();
  if (!apiKey || !model || !baseUrl) {
    throw new OmniRouteError('AI assistance is not configured. Set OMNIROUTE_BASE_URL, OMNIROUTE_API_KEY, and OMNIROUTE_MODEL on the backend.', 503);
  }

  let endpoint: URL;
  try {
    endpoint = endpointFor(baseUrl);
  } catch (error) {
    if (error instanceof OmniRouteError) throw error;
    throw new OmniRouteError('OMNIROUTE_BASE_URL must be a valid absolute URL.', 503);
  }

  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 700,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (error instanceof OmniRouteError) throw error;
    throw new OmniRouteError('The AI service could not be reached. Please try again shortly.', 502);
  }

  if (!response.ok) {
    throw new OmniRouteError(`The AI service returned HTTP ${response.status}. Please try again shortly.`, 502);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new OmniRouteError('The AI service returned an invalid response.', 502);
  }

  const content = (body as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new OmniRouteError('The AI service returned no answer.', 502);
  }
  return content.trim().slice(0, 6000);
}
