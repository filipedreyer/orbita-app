const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You classify a single inbox text into the simplest useful entity suggestion.

Your task:
- read the text
- infer the user's likely intent
- suggest the simplest valid type
- suggest a goal or project link only if the text clearly supports it

Rules:
- execution-first rule: if the text describes something to be done, classify it as tarefa or lembrete
- mentioning a project or goal does not make the item a projeto or meta
- use project or goal references mainly to suggest linkage, not type
- prefer simple types like tarefa or nota when uncertain
- do not overfit to complex entities
- structural entities are rare:
  - use projeto only if the text clearly defines creating or framing a project itself
  - use meta only if the text clearly defines a long-term direction or outcome
  - use inegociavel only if the text clearly defines an explicit rule, limit, or structural constraint
- do not hallucinate links
- when in doubt, always return tarefa
- use low confidence more often when distinguishing tarefa from projeto, meta, or inegociavel
- if unclear, return:
  - suggestedType = tarefa
  - suggestedLink.kind = none
  - suggestedLink.label = null
  - confidence = low
- keep reason short and operational

Return valid JSON only with this exact shape:
{
  "suggestedType": "tarefa | nota | ideia | lembrete | meta | projeto | habito | rotina | evento | inegociavel",
  "suggestedLink": {
    "kind": "project | goal | none",
    "label": "string | null"
  },
  "confidence": "low | medium | high",
  "reason": "short explanation"
}`;

type InboxClassificationInput = {
  text: string;
  existingContext: {
    knownProjects: string[];
    knownGoals: string[];
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

async function callOpenAI(input: InboxClassificationInput, apiKey: string, model: string) {
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

function isValidSuggestion(payload: Record<string, unknown> | null) {
  if (!payload) return false;
  const suggestedType = payload.suggestedType;
  const suggestedLink = payload.suggestedLink;
  const confidence = payload.confidence;
  const reason = payload.reason;

  if (typeof suggestedType !== 'string') return false;
  if (!suggestedLink || typeof suggestedLink !== 'object') return false;
  if (typeof confidence !== 'string') return false;
  if (typeof reason !== 'string') return false;

  const kind = (suggestedLink as { kind?: unknown }).kind;
  const label = (suggestedLink as { label?: unknown }).label;
  if (!['project', 'goal', 'none'].includes(String(kind))) return false;
  if (!(typeof label === 'string' || label === null)) return false;

  return true;
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

  let input: InboxClassificationInput;
  try {
    input = (await request.json()) as InboxClassificationInput;
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
  const rawText = extractTextFromResponse(responsePayload);
  const parsed = tryParseJson(rawText);

  if (!isValidSuggestion(parsed)) {
    return jsonResponse({ error: 'Malformed AI response.' }, 502);
  }

  return jsonResponse(parsed);
});
