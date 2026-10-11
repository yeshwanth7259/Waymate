import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OmniRouteError, requestOmniRoute } from './omniroute.js';

const env = {
  OMNIROUTE_BASE_URL: 'https://ai.example/v1/',
  OMNIROUTE_API_KEY: 'server-secret',
  OMNIROUTE_MODEL: 'provider/model',
};

test('sends OpenAI-compatible requests to OmniRoute without exposing credentials in the URL', async () => {
  let requestedUrl = '';
  let authorization = '';
  const answer = await requestOmniRoute(
    [{ role: 'user', content: 'Suggest a route.' }],
    env,
    async (input, init) => {
      requestedUrl = String(input);
      authorization = new Headers(init?.headers).get('authorization') || '';
      return Response.json({ choices: [{ message: { content: 'Compare the available routes.' } }] });
    },
  );

  assert.equal(requestedUrl, 'https://ai.example/v1/chat/completions');
  assert.equal(authorization, 'Bearer server-secret');
  assert.equal(answer, 'Compare the available routes.');
});

test('requires backend-only OmniRoute configuration', async () => {
  await assert.rejects(
    requestOmniRoute([{ role: 'user', content: 'Help.' }], {}),
    (error: unknown) => error instanceof OmniRouteError && error.statusCode === 503,
  );
});

test('rejects non-HTTPS remote gateways', async () => {
  await assert.rejects(
    requestOmniRoute([{ role: 'user', content: 'Help.' }], { ...env, OMNIROUTE_BASE_URL: 'http://ai.example' }),
    (error: unknown) => error instanceof OmniRouteError && error.statusCode === 503,
  );
});

test('reports upstream failures without returning their response body', async () => {
  await assert.rejects(
    requestOmniRoute([{ role: 'user', content: 'Help.' }], env, async () => new Response('sensitive upstream detail', { status: 503 })),
    (error: unknown) => error instanceof OmniRouteError && error.statusCode === 502 && !error.message.includes('sensitive'),
  );
});
