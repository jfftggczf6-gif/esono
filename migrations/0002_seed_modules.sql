-- Insert predefined modules for Phase 1 MVP

-- Step 1: Comprendre l'activité
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order) VALUES
('step1_business_model', 'Business Model Canvas', 'Cartographie de votre modèle économique : clients, proposition de valeur, canaux de distribution, revenus et coûts', 1, 45, 'foundation', 1),
('step1_activity_report', 'Rapport d''Activité', 'Analyse complète de votre activité actuelle : historique, équipe, produits/services, marchés', 1, 40, 'foundation', 2),
('step1_social_impact', 'Social Impact Canvas', 'Mesure de votre impact social : bénéficiaires, problème résolu, indicateurs d''impact', 1, 35, 'foundation', 3);

-- Step 2: Analyse financière
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order) VALUES
('step2_financial_analysis', 'Analyse Financière', 'Diagnostic de vos états financiers : bilan, compte de résultat, ratios clés', 2, 50, 'foundation', 4);

-- Step 3: Projections financières
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order) VALUES
('step3_projections', 'Projections Financières', 'Prévisions à 3 ans : chiffre d''affaires, charges, rentabilité (3 scénarios)', 3, 60, 'foundation', 5);

-- Step 4: Business Plan
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order) VALUES
('step4_business_plan', 'Business Plan Complet', 'Synthèse professionnelle de votre projet : vision, marché, stratégie, finances, équipe', 4, 90, 'foundation', 6);

-- Step 5: Impact & ODD
INSERT OR IGNORE INTO modules (module_code, title, description, step_number, estimated_time, module_type, display_order) VALUES
('step5_odd_mapping', 'Objectifs de Développement Durable', 'Alignement de votre projet avec les ODD de l''ONU et indicateurs mesurables', 5, 40, 'foundation', 7);
