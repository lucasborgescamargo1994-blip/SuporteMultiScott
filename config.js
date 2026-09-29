/* ═══════════════════════════════════════════════════════════════
   Configuração compartilhada pelas 3 pontas:
   index.html (chat) · painel.html (empresa) · admin.html (você)

   Pegue os dois valores em: Supabase → Project Settings → API
   A chave aqui é a PÚBLICA (anon / publishable). Ela pode ficar
   no navegador: quem protege os dados são as regras do schema.sql.
   NUNCA coloque aqui a service_role / secret key.
   ═══════════════════════════════════════════════════════════════ */
window.SM_CONFIG = {
  SUPABASE_URL: 'https://zjvgkrjcwqbnrqiltbtb.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqdmdrcmpjd3FibnJxaWx0YnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NDgzMzEsImV4cCI6MjEwNjIyNDMzMX0.lBP846yxrRc0J35InX7wyz7uozeOaOKlm2LSwEMTRfk',

  // Nome da Edge Function (pasta supabase/functions/atendimento)
  FUNCAO: 'atendimento',

  // Endereço público onde o index.html (chat) foi publicado, terminando em "/".
  // Usado para montar os links e o código do widget. Ex.: 'https://atendimento.seudominio.com.br/'
  // Deixe vazio enquanto testa localmente.
  CHAT_URL: 'https://lucasborgescamargo1994-blip.github.io/SuporteMultiScott/',
};

// Aceita a URL copiada com sobras (ex.: ".../rest/v1/"): usa só o endereço do projeto
window.SM_CONFIG.SUPABASE_URL = String(window.SM_CONFIG.SUPABASE_URL || '').trim().replace(/\/(rest|auth|functions)\/v1.*$/, '').replace(/\/+$/, '');

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
// Grau de criatividade da IA (0 = só o banco de dados · 100 = liberdade total).
// As faixas precisam bater com regrasCriatividade() da Edge Function.
window.smNivelCriatividade = function (v) {
  v = Number(v) || 0;
  if (v < 20) return { icone: '📚', nome: 'Estrito', texto: 'Responde só com o que está no banco de dados, mantendo as respostas aprovadas. Se não tiver, encaminha para a equipe.' };
  if (v < 40) return { icone: '🧩', nome: 'Conservador', texto: 'Reescreve e combina as informações do banco de forma natural, sem acrescentar nada que não esteja lá.' };
  if (v < 60) return { icone: '⚖️', nome: 'Equilibrado', texto: 'Usa o banco e pode dar orientações gerais de bom senso (dicas, explicações), sem inventar dados da empresa.' };
  if (v < 80) return { icone: '💡', nome: 'Flexível', texto: 'Responde dúvidas gerais do segmento com conhecimento próprio. Preços, prazos e políticas só se estiverem no banco.' };
  return { icone: '🎨', nome: 'Livre', texto: 'Conversa e responde com liberdade mesmo sem nada no banco. Preço, prazo ou estoque que não estão no banco são citados como estimativa, sujeita à confirmação da equipe.' };
};
// HTML do controle deslizante (usado no admin e no painel). id = prefixo dos elementos.
window.smControleCriatividade = function (id, valor, desativado) {
  const n = window.smNivelCriatividade(valor);
  return `<div class="criat" id="${id}">
    <div class="criat-topo"><span>📚 Só o banco de dados</span><b id="${id}Val">${valor}% · ${n.icone} ${n.nome}</b><span>🎨 Liberdade total</span></div>
    <input type="range" min="0" max="100" step="5" value="${valor}" id="${id}Rng" ${desativado ? 'disabled' : ''} oninput="smAtualizarCriatividade('${id}')">
    <p class="criat-desc" id="${id}Desc">${n.texto}</p></div>`;
};
window.smAtualizarCriatividade = function (id) {
  const v = +document.getElementById(id + 'Rng').value, n = window.smNivelCriatividade(v);
  document.getElementById(id + 'Val').textContent = `${v}% · ${n.icone} ${n.nome}`;
  document.getElementById(id + 'Desc').textContent = n.texto;
};
window.smConfigurado = function () {
  const c = window.SM_CONFIG || {};
  return /^https:\/\/.+/.test(c.SUPABASE_URL || '') && !/SEU-PROJETO/.test(c.SUPABASE_URL) && c.SUPABASE_KEY && !/COLE-AQUI/.test(c.SUPABASE_KEY);
};
