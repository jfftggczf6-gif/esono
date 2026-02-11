-- Phase 1 bis (Rapport d'activité) schema additions
-- Table de stockage des réponses structurées
CREATE TABLE IF NOT EXISTS activity_report_inputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_id INTEGER NOT NULL,
  progress_id INTEGER,
  vision TEXT,
  mission TEXT,
  problem_statement TEXT,
  solution TEXT,
  differentiation TEXT,
  customer_segments TEXT,
  market_size TEXT,
  market_trends TEXT,
  competition TEXT,
  traction TEXT,
  business_model TEXT,
  revenue_streams TEXT,
  pricing_strategy TEXT,
  go_to_market TEXT,
  team_summary TEXT,
  team_gaps TEXT,
  financial_needs TEXT,
  fund_usage TEXT,
  proof_points TEXT,
  risks TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_report_inputs_user_module ON activity_report_inputs(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_activity_report_inputs_progress ON activity_report_inputs(progress_id);

-- Journaux d'analyse IA pour le rapport d'activité
CREATE TABLE IF NOT EXISTS activity_report_analysis_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id INTEGER NOT NULL,
  analysis_type TEXT DEFAULT 'auto',
  overall_score INTEGER,
  clarity_score INTEGER,
  realism_score INTEGER,
  precision_score INTEGER,
  summary_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_report_analysis_logs_progress ON activity_report_analysis_logs(progress_id);

-- Enrichissements du suivi de progression
ALTER TABLE progress ADD COLUMN narrative_last_refresh DATETIME;
