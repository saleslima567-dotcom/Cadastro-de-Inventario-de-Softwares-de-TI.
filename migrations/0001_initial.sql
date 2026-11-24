-- Initial schema for Inventário de Softwares de TI.
-- All inventory records are scoped to the owning account.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS softwares (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 1 AND 160),
  versao TEXT NOT NULL CHECK(length(trim(versao)) BETWEEN 1 AND 80),
  licenca TEXT NOT NULL CHECK(licenca IN ('Trial','Anual','Vitalícia')),
  renovacao TEXT,
  responsavel TEXT NOT NULL CHECK(length(responsavel) BETWEEN 3 AND 254),
  nome_key TEXT NOT NULL,
  versao_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK((licenca = 'Vitalícia' AND renovacao IS NULL) OR
        (licenca <> 'Vitalícia' AND renovacao IS NOT NULL AND length(renovacao) = 10)),
  UNIQUE(user_id,nome_key,versao_key)
);
CREATE INDEX IF NOT EXISTS softwares_user_renovacao_idx ON softwares(user_id,renovacao);
