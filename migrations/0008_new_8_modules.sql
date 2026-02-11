-- ═══════════════════════════════════════════════════════════════════
-- Migration 0008: Nouvelle architecture 8 modules séquentiels
-- Modules 1-3 : HYBRIDES (micro-learning + IA + coaching)
-- Modules 4-8 : TRAITEMENT IA AUTOMATIQUE
-- ═══════════════════════════════════════════════════════════════════

-- Ajouter les nouvelles colonnes à la table modules
ALTER TABLE modules ADD COLUMN module_number INTEGER DEFAULT 0;
ALTER TABLE modules ADD COLUMN category TEXT DEFAULT 'hybrid';
ALTER TABLE modules ADD COLUMN icon TEXT DEFAULT 'fas fa-circle';
ALTER TABLE modules ADD COLUMN color TEXT DEFAULT '#1e3a5f';

-- Ajouter colonnes manquantes à progress (coach_validated, coach_notes)
ALTER TABLE progress ADD COLUMN coach_validated BOOLEAN DEFAULT 0;
ALTER TABLE progress ADD COLUMN coach_notes TEXT;

-- Ajouter colonnes manquantes à deliverables
ALTER TABLE deliverables ADD COLUMN module_code TEXT;
ALTER TABLE deliverables ADD COLUMN file_format TEXT;
ALTER TABLE deliverables ADD COLUMN generation_status TEXT DEFAULT 'pending';
ALTER TABLE deliverables ADD COLUMN error_message TEXT;
ALTER TABLE deliverables ADD COLUMN generated_at DATETIME;

-- Insérer les 8 nouveaux modules
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order, is_active, module_number, category, icon, color) VALUES
  ('mod1_bmc', 'Business Model Canvas', 'Cartographier les 9 blocs de votre modèle économique avec aide IA et coaching', 1, 45, 'foundation', 1, 1, 1, 'hybrid', 'fas fa-diagram-project', '#1e3a5f'),
  ('mod2_sic', 'Social Impact Canvas', 'Formaliser votre impact social, mapper les ODD, définir indicateurs mesurables', 2, 35, 'foundation', 2, 1, 2, 'hybrid', 'fas fa-hand-holding-heart', '#059669'),
  ('mod3_inputs', 'Inputs Entrepreneur', 'Collecte structurée des données financières : historiques, produits, RH, CAPEX', 3, 60, 'foundation', 3, 1, 3, 'hybrid', 'fas fa-calculator', '#d97706'),
  ('mod4_framework', 'Framework Analyse PME', 'Modélisation financière automatique : marges, projections 5 ans, scénarios', 4, 15, 'advanced', 4, 1, 4, 'automatic', 'fas fa-chart-bar', '#7c3aed'),
  ('mod5_diagnostic', 'Diagnostic Expert', 'Rapport diagnostic : score crédibilité, risques, forces/faiblesses, plan action', 5, 10, 'advanced', 5, 1, 5, 'automatic', 'fas fa-stethoscope', '#dc2626'),
  ('mod6_ovo', 'Plan Financier OVO', 'Template financier OVO 8 ans : revenus par produit, P&L, cash-flow', 6, 10, 'advanced', 6, 1, 6, 'automatic', 'fas fa-file-excel', '#0284c7'),
  ('mod7_business_plan', 'Business Plan', 'Document Word complet : executive summary, opérations, projet financier', 7, 15, 'advanced', 7, 1, 7, 'automatic', 'fas fa-file-word', '#2563eb'),
  ('mod8_odd', 'Évaluation ODD', 'Évaluation 40 cibles ODD avec scoring et indicateurs impact', 8, 10, 'advanced', 8, 1, 8, 'automatic', 'fas fa-globe-africa', '#059669');

-- Désactiver les anciens modules
UPDATE modules SET is_active = 0 WHERE module_code IN ('step1_business_model', 'step1_activity_report', 'step1_social_impact', 'step2_financial_analysis', 'step3_projections', 'step4_business_plan', 'step5_odd_mapping');

-- Table pour stocker les données modulaires (nouveau format)
CREATE TABLE IF NOT EXISTS module_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_code TEXT NOT NULL,
  section_key TEXT NOT NULL,
  data_json TEXT,
  is_validated BOOLEAN DEFAULT 0,
  validation_score INTEGER,
  ai_feedback TEXT,
  coach_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(user_id, module_code, section_key)
);

CREATE INDEX IF NOT EXISTS idx_module_data_user ON module_data(user_id, module_code);

-- Table pour les sessions de coaching
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_code TEXT NOT NULL,
  section_key TEXT,
  coach_id INTEGER,
  status TEXT DEFAULT 'requested',
  messages_json TEXT,
  notes TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coaching_user ON coaching_sessions(user_id, module_code);
