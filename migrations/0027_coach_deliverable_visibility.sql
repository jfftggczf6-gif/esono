-- Migration 0027: Coach deliverable visibility & coach uploads
-- Adds coach-specific fields to entrepreneur_deliverables
-- Creates coach_uploads table for coach-initiated file uploads

-- Add visibility fields to entrepreneur_deliverables
ALTER TABLE entrepreneur_deliverables ADD COLUMN generated_by TEXT DEFAULT 'entrepreneur';
ALTER TABLE entrepreneur_deliverables ADD COLUMN visibility TEXT DEFAULT 'private';
ALTER TABLE entrepreneur_deliverables ADD COLUMN shared_at TEXT;
ALTER TABLE entrepreneur_deliverables ADD COLUMN coach_user_id INTEGER;

-- Coach uploads: files uploaded by coach on behalf of entrepreneur
CREATE TABLE IF NOT EXISTS coach_uploads (
  id TEXT PRIMARY KEY,
  coach_user_id INTEGER NOT NULL,
  entrepreneur_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('bmc', 'sic', 'inputs', 'supplementary')),
  filename TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  extracted_text TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (coach_user_id) REFERENCES users(id),
  FOREIGN KEY (entrepreneur_id) REFERENCES coach_entrepreneurs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coach_uploads_entrepreneur ON coach_uploads(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_coach_uploads_coach ON coach_uploads(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_visibility ON entrepreneur_deliverables(visibility);
CREATE INDEX IF NOT EXISTS idx_deliverables_generated_by ON entrepreneur_deliverables(generated_by);
