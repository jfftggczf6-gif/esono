-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  user_type TEXT NOT NULL CHECK(user_type IN ('pre_entrepreneur', 'entrepreneur')),
  status TEXT CHECK(status IN ('student', 'entrepreneur', 'alumni')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Modules table (predefined modules like Business Model Canvas, Financial Analysis, etc.)
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  step_number INTEGER NOT NULL,
  estimated_time INTEGER, -- in minutes
  video_url TEXT,
  module_type TEXT NOT NULL CHECK(module_type IN ('foundation', 'advanced')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Progress table (tracks user progress through modules)
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed', 'validated')),
  quiz_score INTEGER,
  quiz_passed BOOLEAN DEFAULT 0,
  current_question INTEGER DEFAULT 1,
  started_at DATETIME,
  completed_at DATETIME,
  validated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id, module_id)
);

-- Questions table (stores user responses to module questions)
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id INTEGER NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  user_response TEXT,
  ai_feedback TEXT,
  quality_score INTEGER,
  iteration_count INTEGER DEFAULT 0,
  is_validated BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_id INTEGER NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers_json TEXT, -- JSON array of answers
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE
);

-- Deliverables table (generated documents)
CREATE TABLE IF NOT EXISTS deliverables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  module_id INTEGER,
  deliverable_type TEXT NOT NULL CHECK(deliverable_type IN ('pdf', 'slides', 'canvas', 'report')),
  title TEXT NOT NULL,
  file_url TEXT,
  content_json TEXT, -- JSON content for regeneration
  is_public BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_progress_id ON questions(progress_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_user_id ON deliverables(user_id);
