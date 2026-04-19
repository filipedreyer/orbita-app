const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a sharp, concise operator reading the current state of a workday.
You are not a planner.
You are not an executor.
You are a reader.

Your task:
1. Identify whether the day is realistic, overloaded, unfocused, or ignoring risk.
2. Highlight the main problem of the day.
3. Add one or two concise observations.
4. Suggest what to remove or what to prioritize.

Rules:
- Maximum 4 to 5 lines total.
- No markdown.
- No bullet points.
- No emojis.
- No motivational tone.
- No generic advice.
- Stay concrete and tied to the provided data only.`;

type TodayItemInput = {
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  linkage: {
    kind: 'goal' | 'project' | 'none';
    label: string | null;
  };
};

type TodayReadInput = {
  agora: TodayItemInput[];
  cabe: TodayItemInput[];
  atencao: TodayItemInput[];
  capacity: 'balanced' | 'loaded' | 'overloaded';
  directionSummary: {
    linked: number;
    standalone: number;
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

  let input: TodayReadInput;
  try {
    input = (await request.json()) as TodayReadInput;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';

  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
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
  });

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
