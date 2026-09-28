-- LinguaSphere AI Learning Platform Database Schema (Multilingual: English, German, Korean)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    level TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_stats (
    user_id INTEGER PRIMARY KEY,
    streak_days INTEGER DEFAULT 1,
    last_active_date TEXT,
    lessons_completed INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    grammar_score REAL DEFAULT 86.0,
    fluency_score REAL DEFAULT 82.0,
    vocabulary_score REAL DEFAULT 80.0,
    active_language TEXT DEFAULT 'english', -- 'english', 'german', 'korean'
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'english', -- 'english', 'german', 'korean'
    mode TEXT NOT NULL DEFAULT 'tutor',
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata_json TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT NOT NULL DEFAULT 'english', -- 'english', 'german', 'korean'
    word TEXT NOT NULL,
    phonetic TEXT,
    part_of_speech TEXT,
    definition TEXT NOT NULL,
    example TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',
    mastery_level INTEGER DEFAULT 1,
    last_reviewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grammar_mistakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT NOT NULL DEFAULT 'english',
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    category TEXT DEFAULT 'Grammar',
    rule_name TEXT DEFAULT 'Rule Analysis',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT NOT NULL DEFAULT 'english',
    mode TEXT NOT NULL, -- 'speaking', 'interview', 'discussion', 'daily'
    topic TEXT NOT NULL,
    level TEXT NOT NULL,
    score REAL DEFAULT 85.0,
    feedback TEXT,
    duration_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS writing_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT NOT NULL DEFAULT 'english',
    task_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    user_text TEXT NOT NULL,
    feedback TEXT NOT NULL,
    score REAL DEFAULT 85.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
