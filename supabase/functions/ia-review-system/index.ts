const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are reading the system, not the day.

Your task:
1. Identify the dominant systemic problem
2. Explain the pattern behind it
3. Highlight what is accumulating or being neglected

Rules:
- maximum 5 lines
- no markdown
- no bullet points
- no motivational tone
- no generic advice
- do not suggest specific actions
- stay at system level`;

type ReviewSystemInput = {
  execution: {
    activeCount: number;
    completedRecent: number;
    standaloneCount: number;
    linkedCount: number;
  };
  risk: {
    overdueCount: number;
    staleCount: number;
    postponedCount: number;
  };
  direction: {
    goalsWithoutExecution: number;
    projectsWithoutSteps: number;
    habitsNotReflected: number;
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

async function callOpenAI(input: ReviewSystemInput, apiKey: string, model: string) {
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
            content: [
              {
                type: 'input_text',
                text: JSON.stringify(input),
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
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

  let input: ReviewSystemInput;
  try {
    input = (await request.json()) as ReviewSystemInput;
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
    const errorText = await openAiResponse.text();
    return jsonResponse({ error: 'OpenAI request failed.', details: errorText }, 502);
  }

  const responsePayload = (await openAiResponse.json()) as Record<string, unknown>;
  const reading = extractTextFromResponse(responsePayload);

  if (!reading) {
    return jsonResponse({ error: 'Empty AI response.' }, 502);
  }

  return jsonResponse({ reading });
});
