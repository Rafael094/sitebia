# Bianca Martins — Site institucional + Painel administrativo

Site institucional *Next.js 15 (App Router)* com painel administrativo integrado
ao **Supabase** (Auth, Postgres e Storage) e geração de SEO com IA (**DeepSeek**).

---

## Requisitos

- Node.js 20+
- Um projeto Supabase (URL, chave anon e chave service_role)

## Como rodar localmente

```bash
npm install
# crie o .env.local com as variáveis abaixo
npm run dev
```

Acesse `http://localhost:3000` (site) e `http://localhost:3000/admin` (painel).

---

## Variáveis de ambiente

> ⚠️ **Segredos nunca entram no repositório.**
> `.env.local` é ignorado pelo Git (ver `.gitignore`). O arquivo `.env.example`
> serve apenas de modelo e **não deve conter chaves reais**.

### Local (desenvolvimento)

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sim | URL pública do site (ex.: `https://biancamartins.com.br`) |
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave anon (pública) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Chave service_role — **somente servidor** |
| `DEEPSEEK_API_KEY` | não | Chave da API do DeepSeek para o SEO por IA |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | não | Envio de e-mail do formulário de contato |
| `SMTP_FROM` / `SMTP_SECURE` | não | Remetente exibido e TLS forçado (portas não padrão) |
| `CONTACT_RECIPIENT_EMAIL` | não | Destino das notificações (`bmadvogada@gmail.com`) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | recomendada | Chave pública do reCAPTCHA v2 (formulários + login) |
| `RECAPTCHA_SECRET_KEY` | recomendada | Chave secreta do reCAPTCHA (somente servidor) |
| `DEEPSEEK_API_URL` / `DEEPSEEK_MODEL` | não | Overrides opcionais do DeepSeek |

Sem `DEEPSEEK_API_KEY` o painel continua funcionando: o SEO é gerado por uma
heurística local (sem IA), sem quebrar nada.

---

## Deploy na Vercel

### 1. Importar o projeto

1. Em [vercel.com](https://vercel.com) → **Add New… → Project** → importe o repositório.
2. Framework detectado: **Next.js** (build `next build`, output padrão).

### 2. Configurar as variáveis de ambiente (incluindo o DeepSeek)

Faça isso **antes** do primeiro deploy (ou redeploye depois de alterar):

1. No projeto da Vercel → **Settings → Environment Variables**.
2. Adicione cada variável e marque os ambientes desejados
   (**Production**, **Preview**, **Development**):

| Name | Value | Ambientes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio.com` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | todos |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | todos |
| `DEEPSEEK_API_KEY` | `sk-...` | todos |
| `SMTP_HOST` | `smtp-relay.brevo.com` | Production, Preview |
| `SMTP_PORT` | `587` (STARTTLS — use 465 só se necessário) | Production, Preview |
| `SMTP_USER` | **login SMTP** do Brevo (ex.: `8f2c1b001@smtp-brevo.com`) | Production, Preview |
| `SMTP_PASS` | **SMTP key** gerada no Brevo (não é a senha da conta) | Production, Preview |
| `SMTP_FROM` | `Site Bianca Martins <contato@biancamartinsinovacao.com.br>` (remetente verificado) | Production, Preview |
| `CONTACT_RECIPIENT_EMAIL` | `bmadvogada@gmail.com` (caixa que recebe os contatos) | Production, Preview |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | chave pública do reCAPTCHA v2 | Production, Preview |
| `RECAPTCHA_SECRET_KEY` | chave secreta do reCAPTCHA v2 | Production, Preview |

> 📮 **SMTP do Brevo — onde pegar os dados:** painel do Brevo →
> **SMTP & API → aba SMTP → SMTP credentials**. Copie o **Login**
> (`xxxxxxx@smtp-brevo.com`) para `SMTP_USER` e gere/copie a **SMTP key** para
> `SMTP_PASS`. Antes disso, cadastre em **Senders & Domains** o e-mail que
> aparecerá como remetente (ou autentique o domínio com SPF/DKIM/DMARC) —
> sem remetente verificado o Brevo recusa o envio.
>
> 🚫 Nunca deixe `SMTP_FROM` vazio apontando para o login SMTP do Brevo: use o
> remetente verificado da Bianca (ex.: `contato@biancamartinsinovacao.com.br`), por
> isso essa variável é **recomendada**, não opcional.

> 💡 A Vercel não aplica `.env.example` automaticamente: as variáveis `SMTP_*`
> precisam ser criadas manualmente (ou via `vercel env add SMTP_HOST` etc.).
> Depois de salvar, **redeploy**.
>
> 💡 **Teste em 1 clique:** após o redeploy, abra `/admin/configuracoes` →
> seção “E-mail de notificação” → **Verificar SMTP** (confere conexão/AUTH e
> lista variáveis faltantes) e **Enviar e-mail de teste** (dispara para o
> destino configurado). A rota usada é `GET|POST /api/admin/smtp-test`,
> protegida por sessão de administrador.
>
> 💻 **Teste local (terminal):** com as variáveis no `.env.local`, rode
> `npm run smtp:test` para validar conexão/AUTH e
> `npm run smtp:test -- --send` para enviar um e-mail de teste.

> 🤖 **reCAPTCHA v2:** crie as chaves em
> [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
> (tipo **v2 → “Não sou um robô”**). Informe o domínio do site e copie:
> **chave do site** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e **chave secreta** →
> `RECAPTCHA_SECRET_KEY`. O widget aparece no formulário de contato, na landing
> internacional e no login do painel. Enquanto as chaves não forem definidas,
> o widget fica oculto e a validação é dispensada (não quebra o site).

4. Clique em **Save**. A Vercel injeta os valores no build/runtime — a chave
   **nunca fica exposta no código** e não é enviada ao navegador
   (variáveis sem o prefixo `NEXT_PUBLIC_` existem só no servidor).

4. **Redeploy**: alterações em variáveis exigem um novo deploy
   (*Deployments → ⋯ → Redeploy*).

> 💡 Para atualizar a chave do DeepSeek depois, basta editar o valor em
> Settings → Environment Variables e fazer *Redeploy*. Nenhuma mudança de código
> é necessária — o `lib/deepseek.ts` lê `process.env.DEEPSEEK_API_KEY`.

### 3. Banco de dados

Execute os scripts em `supabase/` no **SQL Editor** do Supabase, na ordem:

```
schema.sql
migrations_v2_sections_seo.sql
migrations_v3_contact_notify.sql
migrations_v4_uploads_bucket.sql
migrations_v5_international.sql
migrations_v6_home_about.sql
migrations_v7_seo_metadata.sql
migrations_v8_page_seo.sql
migrations_v9_analytics.sql
migrations_v10_article_categories.sql
```

> A migração **v10** cria as categorias editáveis em
> `/admin/conteudos/categorias`. Sem ela, o site continua funcionando com as
> três categorias padrão, mas o painel não consegue salvar alterações.

### 4. (Opcional) Sincronização por cron

Rotas de cron protegidas por `CRON_SECRET` (ex.: métricas de anúncios) podem ser
agendadas no `vercel.json`. Defina `CRON_SECRET` nas Environment Variables e
configure o `vercel.json` conforme o módulo for habilitado.

---

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos (`tsc --noEmit`) |
