# Manda Bem! — Visão Geral Técnica

App web de estudos personalizados (originalmente "The Joy School"), construído para que um responsável gere exercícios de revisão a partir de material escolar (foto ou texto colado) usando IA, e os alunos estudem e acompanhem o próprio progresso. Multi-usuário, com aprovação administrativa e dados compartilhados na nuvem (qualquer dispositivo/navegador vê os mesmos dados).

## Stack

- **Frontend**: React 19 + TypeScript + Vite, sem roteador (SPA de tela única, troca de "telas" via estado React). Hospedado na **Vercel**.
- **Backend**: Node.js + Express (`api-proxy.js`), hospedado no **Render** (plano free — hiberna após inatividade, pode levar ~50s para responder no primeiro request).
- **Banco de dados**: Postgres gerenciado pelo **Supabase**, acessado só pelo backend (nunca direto do navegador) via `@supabase/supabase-js` com a chave secreta (service role / `sb_secret_...`). Row Level Security está **desativado** em todas as tabelas — todo o controle de acesso é feito na camada do Express, não no Postgres.
- **IA**: `@anthropic-ai/sdk` (API oficial da Anthropic), usando **structured outputs** (`output_config.format` + schema Zod + `messages.parse()`) para gerar os exercícios — garante JSON válido, sem parsing manual de texto.
- **E-mail**: `nodemailer` via SMTP do Gmail, usando uma conta dedicada (`mandabem67@gmail.com`) com senha de app. Não usa mais o Resend (seu modo sandbox só entregava e-mail para o dono da conta, sem domínio verificado).

## Estrutura de pastas

```
english-learning-app/
├── api-proxy.js          # Backend Express (único arquivo de rotas)
├── db.js                 # Toda a lógica de acesso ao Supabase (só usada por api-proxy.js)
├── supabase-schema.sql   # DDL completo: tabelas, grants, RLS desativado
├── .env.example           # Variáveis de ambiente do backend
├── .env.frontend.example  # Variável de ambiente do frontend (VITE_API_URL)
└── src/
    ├── App.tsx            # Componente raiz — estado global, roteamento por tela
    ├── types.ts            # Tipos compartilhados (Subject, Question, UserAccount, ...)
    ├── components/         # Um componente por tela/modal (ver tabela abaixo)
    └── utils/              # Clientes HTTP finos para cada grupo de endpoints (todos async)
```

## Modelo de dados (Supabase / Postgres)

| Tabela | Campos principais | Observação |
|---|---|---|
| `users` | `id`, `username` (único), `password` (texto puro), `email`, `parent_password`, `approved` | Conta de aluno/responsável. **Senha não tem hash** — ver "Limitações conhecidas". |
| `app_config` | `key`, `value` | Config de app inteiro; hoje só guarda `admin_passcode` (senha mestre de 6 dígitos). |
| `subjects` | `id`, `name`, `content`, `summary`, `topics` (jsonb), `questions` (jsonb), `enabled` | Uma matéria e seus exercícios gerados pela IA. |
| `student_profiles` | `user_id` (FK), `name`, `grade`, `school`, `photo` | Perfil do aluno (1:1 com `users`). |
| `user_progress` | `user_id` (FK), `total_points`, `subject_scores` (jsonb), `last_accessed` | Pontuação agregada por aluno. |
| `quiz_progress` | `user_id` + `subject_id` (PK composta), `current_index`, `answers`, `results` | Permite retomar um quiz de onde parou. |
| `password_reset_tokens` | `token` (PK), `user_id`, `expires_at` | Token de "esqueci minha senha", expira em 1h, uso único. |

Todas as FKs usam `on delete cascade` (remover um usuário limpa perfil/progresso/tokens automaticamente).

## Backend — endpoints (`api-proxy.js`)

Todas as rotas de dados exigem `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` configuradas (middleware `requireDb`, retorna 503 caso contrário).

| Grupo | Rotas |
|---|---|
| IA / exercícios | `POST /api/generate-exercises` (imagem ou texto → `{summary, topics, questions}`) |
| E-mail | `POST /api/send-email` (templates `pending`/`approved`) |
| Usuários | `GET/POST /api/users`, `POST /api/users/login`, `POST /api/users/:id/approve`, `DELETE /api/users/:id`, `POST /api/users/:id/validate-parent-password`, `PUT /api/users/:id/password` |
| Esqueci senha | `POST /api/users/forgot-password`, `POST /api/users/reset-password` |
| Senha de admin | `GET /api/admin-passcode`, `POST /api/admin-passcode/validate`, `POST /api/admin-passcode` |
| Matérias | `GET/POST /api/subjects`, `PUT/DELETE /api/subjects/:id` |
| Perfil | `GET/PUT /api/profiles/:userId` |
| Progresso | `GET/PUT /api/progress/:userId` |
| Progresso de quiz | `GET/PUT/DELETE /api/quiz-progress/:userId/:subjectId` |

## Frontend — componentes principais

| Componente | Papel |
|---|---|
| `App.tsx` | Estado raiz (usuário logado, matérias, progresso), decide qual tela renderizar |
| `Login.tsx` | Login, criação de conta (já inclui o perfil do aluno no mesmo formulário), "esqueci minha senha", e os 3 pontos de entrada administrativos (Acesso Administrador, Configurações, Área dos Pais) |
| `ResetPassword.tsx` | Tela acessada via link `?reset_token=...` do e-mail de redefinição |
| `SubjectSelector.tsx` | Tela inicial do aluno logado — escolher matéria (sem nenhum botão de admin) |
| `Lesson.tsx` / `Quiz.tsx` | Exercícios de uma matéria, com progresso salvo a cada resposta |
| `StudentProfileSetup.tsx` / `ProfileFields.tsx` | Edição de perfil (nome, série, escola, foto/avatar) — campos compartilhados com o formulário de cadastro |
| `AdminPanel.tsx` | Senha de admin, cadastro de matérias, geração de exercícios (texto ou foto) |
| `AdminUsersPanel.tsx` | Aprovar/remover usuários, trocar senha de qualquer um sem precisar de e-mail |
| `ParentAccess.tsx` | Mesma lista de usuários + resetar progresso de qualquer aluno por matéria |
| `ResetMyProgress.tsx` | Aluno reseta o próprio progresso usando a senha dos pais (por conta, diferente da senha de admin) |

Todos os componentes de admin/pais exigem a **senha de administrador de 6 dígitos** (exceto "Resetar Meu Progresso", que usa a senha dos pais específica daquela conta).

## Variáveis de ambiente

**Backend (Render)**: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM` (opcional), `FRONTEND_URL`, `PORT` (Render define sozinho).

**Frontend (Vercel)**: `VITE_API_URL` (URL pública do backend no Render).

## Deploy

- Branch `main` → auto-deploy Vercel (frontend) e Render (backend); nem sempre dispara sozinho, às vezes precisa forçar manualmente nos dois painéis.
- Banco: mudanças de schema vão em `supabase-schema.sql` e precisam ser coladas manualmente no SQL Editor do Supabase (não há migração automática).

## Limitações conhecidas (decisões deliberadas, não bugs)

- **Senhas em texto puro** no banco (sem hash). Aceitável para este uso familiar, mas não deve ser reusado para algo com dados sensíveis sem corrigir isso primeiro.
- **Sem rate limiting** nos endpoints de login/senha.
- **Render free tier** hiberna — primeiro request após inatividade pode demorar ~50s.
- **Gmail SMTP** tem limite de volume de envio de uma conta pessoal (suficiente para uso familiar, não para escala).
- RLS desativado no Postgres: segurança depende inteiramente do backend nunca expor a chave secreta do Supabase ao cliente (hoje não expõe).
