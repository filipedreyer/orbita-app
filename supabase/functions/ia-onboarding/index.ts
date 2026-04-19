const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You help structure a planning system through guided steps.

Your task:
- read the current onboarding step
- turn short user input into concrete structure suggestions
- return only usable entities for the current step

Rules:
- max 5 suggestions
- no long explanations
- no generic advice
- no motivational language
- suggestions must be concrete and usable
- use linkedTo only when the link is clearly supported by existingStructure
- do not invent ids
- output JSON only

Step mapping:
- goals -> type must be meta
- projects -> type must be projeto
- habits -> type must be habito
- inegociaveis -> type must be inegociavel

Return valid JSON only with this exact shape:
{
  "suggestions": [
    {
      "type": "meta | projeto | habito | inegociavel",
      "title": "string",
      "description": "short optional",
      "linkedTo": "optional id"
    }
  ]
}`;

type OnboardingStep = 'goals' | 'projects' | 'habits' | 'inegociaveis';

type OnboardingPayload = {
  step: OnboardingStep;
  userInput: string;
  existingStructure?: {
    goals?: Array<{ id: string; title: string }>;
    projects?: Array<{ id: string; title: string; goal_id?: string | null }>;
    habits?: Array<{ id: string; title: string }>;
    inegociaveis?: Array<{ id: string; title: string }>;
  };
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

async function callOpenAI(input: OnboardingPayload, apiKey: string, model: string) {
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

function expectedTypeForStep(step: OnboardingStep) {
  if (step === 'goals') return 'meta';
  if (step === 'projects') return 'projeto';
  if (step === 'habits') return 'habito';
  return 'inegociavel';
}

function isValidResponse(payload: Record<string, unknown> | null, step: OnboardingStep, validGoalIds: Set<string>) {
  if (!payload || !Array.isArray(payload.suggestions) || payload.suggestions.length > 5) return false;

  const expectedType = expectedTypeForStep(step);
  return payload.suggestions.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const record = entry as Record<string, unknown>;
    const linkedTo = record.linkedTo;
    const validLinkedTo =
      linkedTo === undefined || linkedTo === null || (typeof linkedTo === 'string' && (step !== 'projects' || validGoalIds.has(linkedTo)));

    return (
      record.type === expectedType &&
      typeof record.title === 'string' &&
      record.title.trim().length > 0 &&
      (record.description === undefined || record.description === null || typeof record.description === 'string') &&
      validLinkedTo
    );
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

  let input: OnboardingPayload;
  try {
    input = (await request.json()) as OnboardingPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const validGoalIds = new Set((input.existingStructure?.goals ?? []).map((goal) => goal.id));
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

  if (!isValidResponse(parsed, input.step, validGoalIds)) {
    return jsonResponse({ error: 'Malformed AI response.' }, 502);
  }

  return jsonResponse(parsed);
});

