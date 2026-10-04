-- Manda Bem! - Esquema do banco de dados Supabase
--
-- Cole este arquivo inteiro no Supabase (SQL Editor -> New query -> Run).
-- Pode rodar mais de uma vez com seguranca: "create table if not exists"
-- nao apaga nem duplica tabelas ja criadas.

create extension if not exists pgcrypto;

-- Configuracoes gerais do app (ex: senha de administrador)
create table if not exists app_config (
  key text primary key,
  value text not null
);

-- Contas de usuario (alunos/responsaveis)
create table if not exists users (
  id text primary key,
  username text unique not null,
  password text not null,
  email text,
  parent_password text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Materias/assuntos (com as perguntas geradas)
create table if not exists subjects (
  id text primary key,
  name text not null,
  description text,
  content text,
  summary text,
  topics jsonb,
  questions jsonb not null default '[]'::jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Perfil do aluno (nome, serie, escola, foto)
create table if not exists student_profiles (
  user_id text primary key references users(id) on delete cascade,
  name text,
  grade text,
  school text,
  photo text
);

-- Progresso geral do aluno (pontos totais, pontuacao por materia)
create table if not exists user_progress (
  user_id text primary key references users(id) on delete cascade,
  total_points integer not null default 0,
  subject_scores jsonb not null default '{}'::jsonb,
  last_accessed timestamptz
);

-- Progresso de um quiz em andamento (para continuar de onde parou)
create table if not exists quiz_progress (
  user_id text not null references users(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  current_index integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  primary key (user_id, subject_id)
);

-- Tokens de "esqueci minha senha" (expiram depois de 1 hora)
create table if not exists password_reset_tokens (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Garante que a API (usada pelo backend com a chave secreta/service_role)
-- tenha permissao de leitura e escrita nessas tabelas, incluindo tabelas
-- futuras criadas do mesmo jeito.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Todo o controle de acesso (senha de administrador, aprovacao de usuario,
-- senha dos pais) ja e feito pelo backend Express antes de chamar o banco,
-- entao nao precisamos de Row Level Security aqui dentro do Postgres.
alter table app_config disable row level security;
alter table users disable row level security;
alter table subjects disable row level security;
alter table student_profiles disable row level security;
alter table user_progress disable row level security;
alter table quiz_progress disable row level security;
alter table password_reset_tokens disable row level security;
