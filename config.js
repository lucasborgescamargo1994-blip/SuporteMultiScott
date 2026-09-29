/* ═══════════════════════════════════════════════════════════════
   Configuração compartilhada pelas 3 pontas:
   index.html (chat) · painel.html (empresa) · admin.html (você)

   Pegue os dois valores em: Supabase → Project Settings → API
   A chave aqui é a PÚBLICA (anon / publishable). Ela pode ficar
   no navegador: quem protege os dados são as regras do schema.sql.
   NUNCA coloque aqui a service_role / secret key.
   ═══════════════════════════════════════════════════════════════ */
window.SM_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_KEY: 'COLE-AQUI-A-CHAVE-ANON-OU-PUBLISHABLE',

  // Nome da Edge Function (pasta supabase/functions/atendimento)
  FUNCAO: 'atendimento',

  // Endereço público onde o index.html (chat) foi publicado, terminando em "/".
  // Usado para montar os links e o código do widget. Ex.: 'https://atendimento.seudominio.com.br/'
  // Deixe vazio enquanto testa localmente.
  CHAT_URL: '',
};

// Utilitário comum: chama a Edge Function e devolve a mensagem de erro amigável
window.smChamar = async function (sb, acao, dados) {
  const { data, error } = await sb.functions.invoke(window.SM_CONFIG.FUNCAO, { body: { acao, ...(dados || {}) } });
  if (error) {
    let msg = error.message || 'Falha de comunicação';
    try { const j = await error.context.json(); if (j && j.erro) msg = j.erro; } catch (e) { /* resposta sem JSON */ }
    throw new Error(msg);
  }
  return data;
};
window.smConfigurado = function () {
  const c = window.SM_CONFIG || {};
  return /^https:\/\/.+/.test(c.SUPABASE_URL || '') && !/SEU-PROJETO/.test(c.SUPABASE_URL) && c.SUPABASE_KEY && !/COLE-AQUI/.test(c.SUPABASE_KEY);
};
