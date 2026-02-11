-- AI feedback persistence and iteration history
ALTER TABLE progress ADD COLUMN ai_score INTEGER;
ALTER TABLE progress ADD COLUMN ai_feedback_json TEXT;
ALTER TABLE progress ADD COLUMN ai_last_analysis DATETIME;

ALTER TABLE questions ADD COLUMN feedback_updated_at DATETIME;

CREATE TABLE IF NOT EXISTS question_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  previous_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON question_history(question_id);
