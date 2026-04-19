const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You interpret the current weekly review only.

Your task:
- read the week's execution pattern
- identify visible balance or drift
- surface accumulated risk without operational suggestions

Rules:
- return at most 3 blocks
- each block must use type: status, focus, or risk
- use each block with a distinct role:
  - status = describe the week's overall state
  - focus = name the dominant weekly pattern
  - risk = point what is accumulating, drifting, or remaining unresolved
- each description must stay short, max 2 lines
- no generic insights
- no action suggestions
- stay at weekly review level
- no markdown
- keep the tone interpretive and measured
- do not sound like a daily report or a planning surface
- avoid repeating the same analytical pattern in all blocks

Return valid JSON only with this exact shape:
{
  "blocks": [
    {
      "type": "status | focus | risk",
      "title": "string",
      "description": "short text"
    }
  ]
}`;

type ReportPayload = {
  weekly: {
    completedThisWeek: number;
    overdueOpenCount: number;
    activeCount: number;
  };
  portfolio: {
    goalsCount: number;
    projectsCount: number;
    habitsCount: number;
    inegociaveisCount: number;
  };
  balance: {
    linkedCount: number;
    standaloneCount: number;
  };
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

async function callOpenAI(input: ReportPayload, apiKey: string, model: string) {
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

function isValidBlockType(value: unknown) {
  return value === 'status' || value === 'focus' || value === 'risk';
}

function isValidResponse(payload: Record<string, unknown> | null) {
  if (!payload || !Array.isArray(payload.blocks) || payload.blocks.length === 0 || payload.blocks.length > 3) return false;

  return payload.blocks.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const record = entry as Record<string, unknown>;
    return (
      isValidBlockType(record.type) &&
      typeof record.title === 'string' &&
      record.title.trim().length > 0 &&
      typeof record.description === 'string' &&
      record.description.trim().length > 0
    );
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) return jsonResponse({ error: 'OPENAI_API_KEY is not configured.' }, 500);

  let input: ReportPayload;
  try {
    input = (await request.json()) as ReportPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

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
    return jsonResponse({ error: 'OpenAI request failed.', details: await openAiResponse.text() }, 502);
  }

  const responsePayload = (await openAiResponse.json()) as Record<string, unknown>;
  const parsed = tryParseJson(extractTextFromResponse(responsePayload));

  if (!isValidResponse(parsed)) {
    return jsonResponse({ error: 'Malformed AI response.' }, 502);
  }

  return jsonResponse(parsed);
});
