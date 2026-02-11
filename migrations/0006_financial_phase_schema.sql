-- Phase 2 (Analyse financière) schema additions
-- New tables for financial inputs, metrics and analysis logs
CREATE TABLE IF NOT EXISTS financial_inputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_id INTEGER NOT NULL,
  progress_id INTEGER,
  period_label TEXT,
  currency TEXT DEFAULT 'XOF',
  revenue_total REAL,
  revenue_recurring REAL,
  revenue_one_time REAL,
  cogs_total REAL,
  gross_margin_pct REAL,
  operating_expenses REAL,
  payroll_expenses REAL,
  marketing_expenses REAL,
  other_expenses REAL,
  ebitda REAL,
  net_income REAL,
  cash_on_hand REAL,
  runway_months REAL,
  debt_total REAL,
  debt_service REAL,
  ltv REAL,
  cac REAL,
  arpu REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_financial_inputs_user_module ON financial_inputs(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_financial_inputs_progress ON financial_inputs(progress_id);

CREATE TABLE IF NOT EXISTS financial_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id INTEGER NOT NULL,
  metric_code TEXT NOT NULL,
  metric_label TEXT,
  value REAL,
  status TEXT CHECK(status IN ('ok', 'attention', 'critical')),
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_financial_metrics_progress ON financial_metrics(progress_id);

CREATE TABLE IF NOT EXISTS financial_analysis_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id INTEGER NOT NULL,
  analysis_type TEXT DEFAULT 'auto',
  overall_score INTEGER,
  summary_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_financial_analysis_logs_progress ON financial_analysis_logs(progress_id);

-- Progress tracking enhancements for financial modules
ALTER TABLE progress ADD COLUMN financial_score INTEGER;
ALTER TABLE progress ADD COLUMN financial_summary_json TEXT;
ALTER TABLE progress ADD COLUMN financial_last_refresh DATETIME;

-- Deliverable metadata for financial diagnostics
ALTER TABLE deliverables ADD COLUMN period_covered TEXT;
ALTER TABLE deliverables ADD COLUMN currency TEXT;
ALTER TABLE deliverables ADD COLUMN kpi_summary_json TEXT;
