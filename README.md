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
| `CONTACT_RECIPIENT_EMAIL` | não | Destino das notificações (fallback do painel) |
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
| `SMTP_FROM` | `Site Bianca Martins <contato@seudominio.com>` (remetente verificado) | Production, Preview |
| `CONTACT_RECIPIENT_EMAIL` | caixa que recebe os contatos | Production, Preview |

> 📮 **SMTP do Brevo — onde pegar os dados:** painel do Brevo →
> **SMTP & API → aba SMTP → SMTP credentials**. Copie o **Login**
> (`xxxxxxx@smtp-brevo.com`) para `SMTP_USER` e gere/copie a **SMTP key** para
> `SMTP_PASS`. Antes disso, cadastre em **Senders & Domains** o e-mail que
> aparecerá como remetente (ou autentique o domínio com SPF/DKIM/DMARC) —
> sem remetente verificado o Brevo recusa o envio.
>
> 🚫 Nunca deixe `SMTP_FROM` vazio apontando para o login SMTP do Brevo: use o
> remetente verificado da Bianca (ex.: `contato@biancamartins.com.br`), por
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
```

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
