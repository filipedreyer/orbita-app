const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are helping adjust a single day without taking control of it.

Your task:
- look at current day capacity, current items, and inegociaveis
- if nearbyDays is provided, use it only to understand the nearest viable next day for small pressure relief
- propose only small reversible interventions inside the current day
- prefer reducing pressure or clarifying focus, not redesigning the day

Rules:
- return at most 3 suggestions
- only reference existing item ids from the input
- suggestion types can only be: defer, keep, highlight
- do not create new items
- do not suggest reordering the entire day
- stay within the current day
- when overload is visible, prefer defer only for items that can leave the current day with the least friction
- if nearbyDays exists, use it to reason about short-range relief, not week redesign
- keep reasons short and operational
- use defer sparingly, mainly when overload is visible
- use highlight when an item deserves explicit attention now
- use keep when the current place of an item still makes sense

Return valid JSON only with this exact shape:
{
  "suggestions": [
    {
      "type": "defer | keep | highlight",
      "itemId": "string",
      "reason": "short explanation"
    }
  ],
  "summary": "short text"
}`;

type SuggestInput = {
  capacity: {
    signal: 'balanced' | 'loaded' | 'overloaded';
    agoraCount: number;
    cabeCount: number;
  };
  items: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string | null;
    due_date: string | null;
    linked: boolean;
    scheduledToday: boolean;
    overdue: boolean;
  }>;
  inegociaveis: {
    fixedCount: number;
    capacityOnlyCount: number;
    blockedCount: number;
  };
  nearbyDays?: Array<{
    date: string;
    signal: 'balanced' | 'loaded' | 'overloaded';
    scheduledCount: number;
  }>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function extractTextFromResponse(payload: Record<string, unknown>) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const fragments = output
    .flatMap((entry) => {
      const content = (entry as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      const text = (content as { text?: unknown }).text;
      return typeof text === 'string' ? text : '';
    })
    .filter(Boolean);

  return fragments.join('\n').trim();
}

async function callOpenAI(input: SuggestInput, apiKey: string, model: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    return await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: JSON.stringify(input) }],
          },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isValidSuggestionType(value: unknown) {
  return value === 'defer' || value === 'keep' || value === 'highlight';
}

function isValidResponse(payload: Record<string, unknown> | null, validIds: Set<string>) {
  if (!payload) return false;
  if (typeof payload.summary !== 'string' || payload.summary.trim().length === 0) return false;
  if (!Array.isArray(payload.suggestions) || payload.suggestions.length > 3) return false;

  const seenIds = new Set<string>();
  return payload.suggestions.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const record = entry as Record<string, unknown>;
    if (!isValidSuggestionType(record.type)) return false;
    if (typeof record.itemId !== 'string' || !validIds.has(record.itemId) || seenIds.has(record.itemId)) return false;
    if (typeof record.reason !== 'string' || record.reason.trim().length === 0) return false;
    seenIds.add(record.itemId);
    return true;
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    return jsonResponse({ error: 'OPENAI_API_KEY is not configured.' }, 500);
  }

  let input: SuggestInput;
  try {
    input = (await request.json()) as SuggestInput;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const validIds = new Set(input.items.map((item) => item.id));
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';

  let openAiResponse: Response;
  try {
    openAiResponse = await callOpenAI(input, openAiKey, model);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return jsonResponse({ error: 'Provider timeout.' }, 504);
    }
    return jsonResponse({ error: 'Provider request failed.' }, 502);
  }

  if (!openAiResponse.ok) {
    const errorText = await openAiResponse.text();
    return jsonResponse({ error: 'OpenAI request failed.', details: errorText }, 502);
  }

  const responsePayload = (await openAiResponse.json()) as Record<string, unknown>;
  const rawText = extractTextFromResponse(responsePayload);
  const parsed = tryParseJson(rawText);

  if (!isValidResponse(parsed, validIds)) {
    return jsonResponse({ error: 'Malformed AI response.' }, 502);
  }

  return jsonResponse(parsed);
});
