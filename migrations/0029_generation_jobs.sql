-- Generation jobs table for async generate-all pipeline
CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'processing',
  progress TEXT DEFAULT '',
  result_json TEXT,
  error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON generation_jobs(user_id, status);
