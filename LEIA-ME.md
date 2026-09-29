# Suporte Multiplataforma — chat web com human learning

## As três pontas

| Arquivo | Quem usa | Para quê |
|---|---|---|
| `index.html` | Cliente dos seus clientes | O chat. Abre por link (`index.html?c=endereco-da-empresa`) ou como balão no site (`widget.js`). |
| `painel.html` | Equipe da empresa | Acompanha as conversas ao vivo e assume quando o cliente pede uma pessoa (aviso sonoro + notificação). |
| `admin.html` | Você | Clientes, bases, **fila de treino**, kits de nicho, relatórios, planos e propostas. |

Tudo conversa com o **Supabase**:
- `supabase/schema.sql`: tabelas, permissões e tempo real.
- `supabase/functions/atendimento/index.ts`: o cérebro do bot, rodando no servidor. Motor determinístico, IA opcional, fila de treino e atendimento humano.

Arquivos de apoio: `config.js` (endereço e chave pública do Supabase), `kits.js` (kits de nicho padrão), `widget.js` (balão para sites).

### Como funciona o human learning
1. O cliente pergunta. Se o bot tem confiança acima do **limiar**, responde com a resposta aprovada.
2. Se não tem certeza, oferece "Você quis dizer…". Se não encontra nada, avisa que a equipe vai responder.
3. Nos dois casos a pergunta vai para a **Fila de treino** do admin (em tempo real, agrupando perguntas parecidas).
4. Você cria a resposta ou liga a pergunta a uma resposta existente. Na próxima vez, o bot já responde.
5. Quando o cliente escolhe uma sugestão, ou marca 👎, isso também alimenta o aprendizado.

---

## Instalação (uma vez)

### 1. Criar o projeto no Supabase
Crie um projeto **novo** em https://supabase.com, separado do projeto da Bsoft.

### 2. Criar o banco
Supabase → **SQL Editor** → cole todo o `supabase/schema.sql` → **Run**.

### 3. Ligar o login anônimo (usado pelo chat)
Supabase → **Authentication → Sign In / Providers** → ative **Allow anonymous sign-ins**.

### 4. Criar o seu usuário de administrador
1. **Authentication → Users → Add user**: seu e-mail, uma senha forte, marque *Auto Confirm User*.
2. No **SQL Editor**, rode (troque o e-mail):
   ```sql
   insert into public.perfis (user_id, papel, nome, email)
   select id, 'admin', 'Administrador', email from auth.users
   where email = 'SEU_EMAIL_AQUI'
   on conflict (user_id) do update set papel = 'admin';
   ```

### 5. Publicar a função do bot
**Pelo painel do Supabase (sem instalar nada):**
1. **Edge Functions → Deploy a new function → Via Editor**, com o nome `atendimento`.
2. Apague o código de exemplo, cole todo o conteúdo de `supabase/functions/atendimento/index.ts` e faça o **Deploy**.
3. Nos detalhes da função, **desligue "Verify JWT"** (Enforce JWT verification). A própria função confere quem está chamando.

**Ou pelo terminal (precisa do Node.js instalado):**
```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase functions deploy atendimento --no-verify-jwt
```

### 6. (Opcional) IA para os clientes da Opção B
**Edge Functions → Secrets**, adicione:

| Nome | Exemplo |
|---|---|
| `IA_PROVIDER` | `openrouter` (ou `google`, ou `custom`) |
| `IA_API_KEY` | sua chave |
| `IA_MODEL` | `google/gemini-2.5-flash` (no OpenRouter) |
| `IA_BASE_URL` | só se for `custom` |

Sem esses segredos, os clientes da Opção B são atendidos pelo motor determinístico.

Para clientes pagantes, use um modelo **pago** barato: os gratuitos têm limite diário e saem do ar sem aviso.

### 7. Preencher o `config.js`
Supabase → **Project Settings → API**: copie a **Project URL** e a chave **anon / publishable** para o `config.js`.

Essa chave é pública, pode ficar no navegador. **Nunca** coloque a `service_role` / secret key em nenhum arquivo deste projeto.

### 8. Publicar os arquivos
Publique `index.html`, `painel.html`, `admin.html`, `config.js`, `kits.js` e `widget.js` em uma hospedagem de site estático. Opções:
- **Netlify Drop**: arrastar a pasta para app.netlify.com/drop.
- **Cloudflare Pages**, **Vercel** ou **GitHub Pages**.

Depois preencha `CHAT_URL` no `config.js` com o endereço publicado (ex.: `https://atendimento.seudominio.com.br/`) e publique de novo. É esse endereço que vai nos links e no código do widget.

> Dá para abrir o `admin.html` e o `painel.html` direto do computador (duplo clique) para testar. Mas a tela "Testar atendimento" do admin funciona melhor com os arquivos publicados ou servidos por um servidor local.

---

## Primeiro uso
1. Abra o `admin.html` e entre com o usuário do passo 4. Os 3 kits de nicho são instalados sozinhos.
2. **Clientes → Novo cliente**: nicho, plano, endereço do chat (ex.: `pizzaria-do-ze`), cor e dados do negócio (horário, preços, taxas…).
   - Com **BD criado**, a base do kit já vem pronta.
   - Para uma demonstração rápida, use "Criar 3 clientes de exemplo".
3. **Testar atendimento**: converse com o bot real e veja os bastidores. Essas conversas não entram nos relatórios.
4. **Clientes → Acessos**: crie o login da equipe da empresa para o `painel.html`.
5. **Clientes → Link / widget**: envie o link direto ou o código do balão para o site do cliente.
6. Toda semana: **Fila de treino**, uns 10 minutos.

---

## Segurança — o que já está coberto e o que falta
- ✅ Chave da IA fica no servidor (segredos da função), nunca no navegador.
- ✅ Permissões por linha (RLS):
  - a empresa só vê as próprias conversas;
  - o visitante só lê a própria conversa;
  - só o admin mexe em bases, kits e clientes.
- ✅ Limite de 20 mensagens por minuto por conversa.
- ⏭️ Antes de escalar: ative **CAPTCHA** no login anônimo (Authentication → Attack Protection) para evitar robôs criando conversas em massa.
- ⏭️ O endereço do `admin.html` é público, mas exige login de administrador. Mesmo assim, não divulgue.

## Pastas
- `versoes-anteriores/`: a versão local (sem servidor) e o backup original do suporte Bsoft TMS.
