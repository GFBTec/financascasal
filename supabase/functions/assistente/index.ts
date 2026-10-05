// Supabase Edge Function `assistente` — responde perguntas do casal sobre os gastos do mês.
// A chave da Anthropic fica só aqui, em `secrets` (ANTHROPIC_API_KEY); nunca no front.
//
// Deploy:  supabase functions deploy assistente
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-opus-5-5';
const MAX_QUESTION_CHARS = 300;
const MAX_CONTEXT_CHARS = 20_000;
const REQUESTS_PER_MINUTE = 10;

const SYSTEM_PROMPT =
  'Você é o assistente financeiro do casal Enddy e Bento. Eles têm uma conta conjunta (conta do casal) ' +
  'abastecida todo mês, de onde saem aluguel, contas fixas e gastos em conjunto. Responda em português do ' +
  'Brasil, em no máximo 3 frases curtas, de forma prática, calorosa e direta, citando valores em R$ quando ' +
  'ajudar. Use apenas os dados fornecidos; se faltar informação, diga isso.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Lê ANTHROPIC_API_KEY do ambiente (secrets da função).
const anthropic = new Anthropic();

/**
 * Chave pública do projeto (anon/publishable). Funciona com o sistema de chaves antigo
 * (SUPABASE_ANON_KEY) e com o novo (SUPABASE_PUBLISHABLE_KEYS em JSON); por último, usa a
 * chave pública que o próprio app envia no cabeçalho `apikey`.
 */
function resolvePublicKey(req: Request): string | undefined {
  const legacy = Deno.env.get('SUPABASE_ANON_KEY');
  if (legacy) return legacy;
  const keysJson = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (keysJson) {
    try {
      const keys = JSON.parse(keysJson) as Record<string, string>;
      const first = keys.default ?? Object.values(keys)[0];
      if (first) return first;
    } catch {
      // formato inesperado: tenta as próximas opções
    }
  }
  return Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? req.headers.get('apikey') ?? undefined;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erro: 'Método não permitido.' }, 405);

  // --- Autenticação: só usuários logados e liberados em `members` --------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ erro: 'Não autenticado.' }, 401);

  const publicKey = resolvePublicKey(req);
  if (!publicKey) {
    console.error('Nenhuma chave pública do Supabase disponível na função');
    return json({ erro: 'Assistente não configurado.' }, 500);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, publicKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData.user) return json({ erro: 'Sessão inválida.' }, 401);

  const { data: isMember } = await supabase.rpc('is_member');
  if (!isMember) return json({ erro: 'Sem acesso.' }, 403);

  // --- Limite de frequência: N perguntas por minuto por usuário -------------------
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from('ai_requests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);
  if ((count ?? 0) >= REQUESTS_PER_MINUTE) {
    return json({ erro: 'Muitas perguntas seguidas. Aguarde um minuto.' }, 429);
  }
  await supabase.from('ai_requests').insert({});

  // --- Entrada -----------------------------------------------------------------
  let pergunta = '';
  let contexto: unknown = null;
  try {
    const body = await req.json();
    pergunta = String(body?.pergunta ?? '').trim().slice(0, MAX_QUESTION_CHARS);
    contexto = body?.contexto ?? null;
  } catch {
    return json({ erro: 'Corpo da requisição inválido.' }, 400);
  }
  if (!pergunta) return json({ erro: 'Pergunta vazia.' }, 400);

  const contextJson = JSON.stringify(contexto ?? {});
  if (contextJson.length > MAX_CONTEXT_CHARS) return json({ erro: 'Contexto grande demais.' }, 413);

  // --- Claude ------------------------------------------------------------------
  try {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Respostas curtas de chat: esforço baixo basta e responde mais rápido.
      output_config: { effort: 'low' },
      // Se o modelo recusar por política, a própria API tenta de novo num modelo de reserva.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Dados do mês do casal (JSON):\n${contextJson}\n\nPergunta: ${pergunta}`,
        },
      ],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);

    if (response.stop_reason === 'refusal') {
      return json({ erro: 'O assistente não pode responder a essa pergunta.' }, 422);
    }

    const resposta = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!resposta) return json({ erro: 'Resposta vazia.' }, 502);
    return json({ resposta });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return json({ erro: 'Assistente ocupado. Tente de novo em instantes.' }, 503);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('ANTHROPIC_API_KEY inválida ou ausente');
      return json({ erro: 'Assistente não configurado.' }, 500);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API ${error.status}:`, error.message);
      return json({ erro: 'Falha ao consultar o assistente.' }, 502);
    }
    console.error(error);
    return json({ erro: 'Falha ao consultar o assistente.' }, 502);
  }
});
