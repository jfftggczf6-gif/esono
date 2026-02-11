-- Validation workflow enhancements for B6/B7
-- Align existing status column if present
UPDATE deliverables SET status = COALESCE(status, 'draft');

ALTER TABLE deliverables ADD COLUMN summary TEXT;
ALTER TABLE deliverables ADD COLUMN ai_score INTEGER;
ALTER TABLE deliverables ADD COLUMN coach_comment TEXT;
ALTER TABLE deliverables ADD COLUMN validated_at DATETIME;

ALTER TABLE questions ADD COLUMN validation_comment TEXT;
