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
