const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You read a note or diary text and extract actionable items.

Your task:
- identify clear actions
- ignore vague reflections
- keep titles short and concrete

Rules:
- do not invent actions
- do not over-extract
- prefer fewer, clearer suggestions
- ignore emotional or descriptive content unless it clearly implies action
- return only tarefa, lembrete, or ideia
- keep titles concise and operational

Return valid JSON only with this exact shape:
{
  "suggestions": [
    {
      "type": "tarefa | lembrete | ideia",
      "title": "short extracted action",
      "confidence": "low | medium | high"
    }
  ]
}`;

type AnalyzeTextInput = {
  text: string;
};

type AnalyzeTextSuggestion = {
  type: 'tarefa' | 'lembrete' | 'ideia';
  title: string;
  confidence: 'low' | 'medium' | 'high';
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

async function callOpenAI(input: AnalyzeTextInput, apiKey: string, model: string) {
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

function tryParseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isValidSuggestion(value: unknown): value is AnalyzeTextSuggestion {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    ['tarefa', 'lembrete', 'ideia'].includes(String(record.type)) &&
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    ['low', 'medium', 'high'].includes(String(record.confidence))
  );
}

function isValidResponse(value: Record<string, unknown> | null) {
  if (!value) return false;
  const suggestions = value.suggestions;
  return Array.isArray(suggestions) && suggestions.every(isValidSuggestion);
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

  let input: AnalyzeTextInput;
  try {
    input = (await request.json()) as AnalyzeTextInput;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const text = typeof input.text === 'string' ? input.text.trim() : '';
  if (!text) {
    return jsonResponse({ suggestions: [] });
  }

  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';

  let openAiResponse: Response;
  try {
    openAiResponse = await callOpenAI({ text }, openAiKey, model);
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

  if (!isValidResponse(parsed)) {
    return jsonResponse({ error: 'Malformed AI response.' }, 502);
  }

  const suggestions = (parsed.suggestions as AnalyzeTextSuggestion[]).map((suggestion) => ({
    type: suggestion.type,
    title: suggestion.title.trim(),
    confidence: suggestion.confidence,
  }));

  return jsonResponse({ suggestions });
});
