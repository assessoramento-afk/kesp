// KESP · Edge Function "kai" · assistente do KESP (etapa 1A)
// Publicar em: Supabase › Edge Functions › Deploy a new function › Via Editor › nome: kai
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const MODELO = 'claude-haiku-5-5';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const INSTRUCOES = `Você é a KAI, assistente do KESP, o sistema de gestão da Kolping Estadual de São Paulo.
Responda sempre em português do Brasil, com tom acolhedor, claro e objetivo (no máximo 3 parágrafos curtos ou uma lista curta de passos).
Nesta fase (etapa 1A), você ajuda a usar o sistema e explica erros em linguagem simples. Você NÃO consulta nem altera dados do sistema.

O que existe hoje no KESP:
- Login por e-mail e senha; pedir acesso (só e-mails @kolpingsp.org e @kolping-sp.org.br, ou por convite); "Esqueci a senha" envia link válido por 1 hora.
- Pessoa nova entra sem permissões e fica "Aguardando liberação" até um administrador liberar.
- Administradores: Henrique e Jaqueline. Só eles liberam acessos e mudam permissões.
- Painel de Controle › Usuários e permissões: abas Pessoas (liberar, recusar, cargo, tornar admin, desativar), Permissões (botões verde ligado / vermelho desligado por pessoa e módulo, ações sensíveis pedem confirmação, alterações só valem ao tocar em Salvar) e Histórico.
- Painel de Controle › Cadastro da Kolping: dados da Kolping Estadual, unidades (Sede, Angélica, Primeiro de Maio), busca automática de CEP e CNPJ, dados bancários restritos.
- Painel de Controle › Sistema: Saúde (erros, usuários, última cópia), Módulos (Em breve, Ativo, Em manutenção) e Cópia (baixar cópia de segurança; recomendado uma vez por semana).
- Ajuda › Andamento do KESP: progresso das etapas e novidades. Ajuda › Manual.
- Menu: módulos futuros ficam em "A caminho" (Assessoramento, recibos, compras, financeiro, RH, Educação Infantil etc.).
- Perfil (círculo com as iniciais, no topo): rever boas-vindas e sair.

Regras:
- Nunca invente funções que não existem; se algo ainda não existe, diga que está "a caminho" e em qual área.
- Se não souber, diga que ainda não sabe responder e sugira enviar a pergunta como sugestão ou falar com Henrique ou Jaqueline.
- Nunca peça nem repita senhas, chaves ou dados bancários.
- Para erros: explique a causa provável em palavras simples e o que a pessoa pode fazer (tentar de novo, atualizar com Ctrl + F5, verificar a internet, avisar o administrador).`;

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta({ erro: 'Método não permitido' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return resposta({ erro: 'Sessão inválida' }, 401);

  const { data: perfil } = await admin.from('perfis').select('id,nome,situacao,admin').eq('id', u.user.id).maybeSingle();
  if (!perfil || perfil.situacao !== 'ativo') return resposta({ erro: 'Acesso não liberado' }, 403);
  if (!perfil.admin) {
    const { data: p } = await admin.from('permissoes').select('funcao_id').eq('perfil_id', perfil.id).eq('funcao_id', 'kai.usar').maybeSingle();
    if (!p) return resposta({ erro: 'Sem permissão para usar a KAI' }, 403);
  }

  let corpo: { mensagens?: { papel: string; texto: string }[] } = {};
  try { corpo = await req.json(); } catch (_) { return resposta({ erro: 'Pedido inválido' }, 400); }
  const mensagens = (corpo.mensagens || []).slice(-10)
    .filter(m => m && typeof m.texto === 'string' && m.texto.trim())
    .map(m => ({ role: m.papel === 'kai' ? 'assistant' : 'user', content: m.texto.slice(0, 2000) }));
  if (!mensagens.length || mensagens[mensagens.length - 1].role !== 'user') return resposta({ erro: 'Mensagem vazia' }, 400);
  while (mensagens.length && mensagens[0].role !== 'user') mensagens.shift();

  const chave = Deno.env.get('ANTHROPIC_API_KEY');
  if (!chave) return resposta({ pausa: true, motivo: 'chave' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': chave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELO, max_tokens: 800, system: INSTRUCOES + `\nQuem pergunta: ${perfil.nome || 'usuário'}${perfil.admin ? ' (administrador)' : ''}.`, messages: mensagens })
  });
  const j = await r.json().catch(() => ({}));

  if (!r.ok) {
    const msg = String(j?.error?.message || r.status);
    await admin.from('erros_sistema').insert({ perfil_id: perfil.id, tela: 'kai', mensagem: 'Falha na KAI', detalhe: msg.slice(0, 500) });
    if (/credit|billing|balance/i.test(msg) || r.status === 402) return resposta({ pausa: true, motivo: 'creditos' });
    if (r.status === 401) return resposta({ pausa: true, motivo: 'chave' });
    if (r.status === 429 || r.status === 529) return resposta({ erro: 'Muitas perguntas ao mesmo tempo. Tente de novo em instantes.' }, 429);
    return resposta({ erro: 'A KAI não conseguiu responder agora.' }, 502);
  }
  const texto = (j.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim();
  return resposta({ texto: texto || 'Não consegui formular uma resposta. Pode perguntar de outro jeito?' });
});
