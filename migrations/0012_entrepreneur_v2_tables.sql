-- Migration 0012: Entrepreneur V2 — NotebookLM-style single page
-- New tables: uploads, entrepreneur_deliverables, iterations, chat_messages

-- Uploads: fichiers BMC/SIC/Inputs uploadés par l'entrepreneur
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('bmc', 'sic', 'inputs', 'supplementary')),
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  extracted_text TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_category ON uploads(user_id, category);

-- Entrepreneur Deliverables: livrables générés par l'IA
CREATE TABLE IF NOT EXISTS entrepreneur_deliverables (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('diagnostic', 'framework', 'bmc_analysis', 'sic_analysis', 'plan_ovo', 'business_plan', 'odd')),
  content TEXT,
  score INTEGER,
  version INTEGER DEFAULT 1,
  iteration_id TEXT,
  status TEXT DEFAULT 'generated',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (iteration_id) REFERENCES iterations(id)
);

CREATE INDEX IF NOT EXISTS idx_edeliverables_user ON entrepreneur_deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_edeliverables_user_type ON entrepreneur_deliverables(user_id, type);

-- Iterations: versions successives après chaque génération/correction
CREATE TABLE IF NOT EXISTS iterations (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  score_global INTEGER,
  scores_dimensions TEXT,
  trigger_type TEXT CHECK(trigger_type IN ('initial', 'chat_correction', 'file_reupload')),
  trigger_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_iterations_user ON iterations(user_id);

-- Chat Messages: historique du chat IA contextuel
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attached_file_id TEXT,
  triggered_iteration_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (attached_file_id) REFERENCES uploads(id),
  FOREIGN KEY (triggered_iteration_id) REFERENCES iterations(id)
);

CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
