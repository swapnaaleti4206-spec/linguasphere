# 🌟 Supernova English AI Learning Platform

> A private, full-stack, AI-powered English Learning and Mastery platform inspired by modern AI language tutors such as Supernova AI. 
> Built with high-performance **FastAPI (Python)**, **SQLite (aiosqlite)**, and modern **Vite + React (Vanilla CSS Design System)**.

---

## 🚀 Quick Start (1-Click Run)

### Option 1: From Your Desktop Folder
A folder named **`EnglishAI-Platform`** has been created directly on your Desktop at:
`C:\Users\ADMIN\OneDrive\Desktop\EnglishAI-Platform` (and mirrored at `C:\Users\ADMIN\Desktop\EnglishAI-Platform`).
1. Double-click **`Launch_English_AI.bat`**.
2. The backend server initializes, mounts the app, and opens your default browser automatically at:
   👉 **`http://127.0.0.1:8000`**

### Option 2: Run From Command Line
```bash
# Terminal 1: Backend
cd backend
python run_backend.py

# Terminal 2: Frontend (for live Vite hot reloading)
cd frontend
npm run dev
```

---

## 🔒 1. Authentication & Access Control

Access is restricted strictly to authorized email accounts. Unauthorized logins are rejected with `HTTP 403 Forbidden`.

### Initial Authorized Learners (2 Users)
| Role | Name | Email | Passcode | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Alex Johnson | `learner1@example.com` | `english2026` | Has full access to Admin Settings & Quota |
| **Learner** | Sarah Miller | `learner2@example.com` | `english2026` | Second authorized learner |

> **Tip:** The login screen includes **1-Click Quick Demo buttons** for both accounts, plus a button to test unauthorized email rejection.

---

## ⚙️ 2. How to Add More Users or Change Max Allowed Users

You can change user counts and add emails anytime **without touching any core code**:

### Method A: From the Web Admin Panel (Easiest)
1. Sign in with `learner1@example.com`
2. Navigate to **Admin Settings** in the left sidebar
3. In **Maximum Allowed Users Quota**, type the new limit (e.g. 5 or 10) and click **Save New Limit**
4. Click **Add Authorized Learner**, provide their name, email, role, and CEFR level.

### Method B: Directly in the Configuration File
Open [`backend/config/allowed_users.json`](file:///C:/Users/ADMIN/.gemini/antigravity-ide/scratch/english-ai-platform/backend/config/allowed_users.json):
```json
{
  "max_allowed_users": 5,
  "allowed_users": [
    {
      "email": "learner1@example.com",
      "name": "Alex Johnson",
      "role": "admin",
      "level": "intermediate"
    },
    {
      "email": "learner2@example.com",
      "name": "Sarah Miller",
      "role": "user",
      "level": "beginner"
    },
    {
      "email": "new.member@example.com",
      "name": "New Member",
      "role": "user",
      "level": "advanced"
    }
  ]
}
```
Save the file. The server automatically reloads configuration instantly without restarting!

---

## 🧠 3. English Learning AI Features

1. **AI English Tutor Chat**:
   - Conversational AI tutor with contextual session memory.
   - English-only mode toggle.
   - Live grammar feedback pills under each message.
   - Voice audio playback (text-to-speech) and microphone voice speech-to-text input (Web Speech API).
   - Word breakdown and phonetic lookup on demand.

2. **Grammar Correction & Sentence Improvement Lab**:
   - Analyzes pasted paragraphs and sentences.
   - Fluency score out of 100.
   - Pinpoints subject-verb, prepositions, tenses, and article mistakes.
   - Suggests natural vocabulary upgrades and generates a formal polished version.

3. **Smart Vocabulary Builder**:
   - Interactive flip flashcards for Beginner, Intermediate, and Advanced tiers.
   - Syllable breakdowns (e.g., `ar-TIC-u-late`), IPA phonetics, and native audio pronunciation.
   - Save words to personal vocabulary bank.

4. **Daily 5-Minute Practice**:
   - Daily idiom with practical context.
   - Grammar multiple-choice puzzle with instant explanations.
   - Everyday dialogue scenarios with natural phrasing examples.
   - Interactive sentence reconstruction scramble puzzle.

5. **Speaking Simulation Studio**:
   - **Job Interview Prep**: Behavioral/technical questions evaluated against the STAR framework.
   - **Group Discussion Forum**: Simulated multi-stakeholder debates.
   - **Public Speaking & Pitch**: Presentation hooks and pacing review.
   - **Everyday Conversation**: Spontaneous small talk dialogues.

6. **Writing Assistants**:
   - **Email Assistant**: Generates and refines professional emails across Formal, Warm, Concise, and Persuasive tones.
   - **Resume & LinkedIn Co-Pilot**: Action-verb bullet point enhancer with metric quantification.
   - **Creative Story Coach**: Sensory details and descriptive narrative expander.

7. **Reading Comprehension & Critical Analysis**:
   - Articles graded by CEFR proficiency level with interactive questions and lexical breakdowns.

8. **Formal Writing Evaluation**:
   - Scores essays across the 4 CEFR/IELTS pillars: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy.
   - Band score out of 9.0 with specific criteria feedback.

9. **Learning Dashboard**:
   - Real-time streak tracking, completed lessons, vocabulary mastered, and error logs.
   - Skill radar competency bars and weekly practice activity chart.
   - Personalized daily recommendations.

10. **Admin Panel**:
    - Manage whitelist roster (add/remove users).
    - Increase or decrease maximum user quota.
    - View platform-wide learning statistics and activity logs.
    - One-click JSON full database backup export.
    - One-click CSV learner progress report download.

---

## 📂 4. Project Structure

```
english-ai-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py         # Login, JWT, access verification
│   │   │       ├── learning.py     # Tutor chat, grammar, vocab, speech, writing
│   │   │       ├── dashboard.py    # Learning stats, metrics, mistake history
│   │   │       └── admin.py        # Whitelist management, quota, data export
│   │   ├── core/
│   │   │   ├── config.py           # Config loader & allowed_users.json sync
│   │   │   ├── security.py         # JWT tokens & bearer auth
│   │   │   └── access_control.py   # Whitelist verification & quota enforcement
│   │   ├── database/
│   │   │   ├── db.py               # Async SQLite connection helpers
│   │   │   └── schema.sql          # 6 SQLite tables for learning data
│   │   ├── services/
│   │   │   └── ai_service.py       # Pedagogical AI engine + optional LLM proxy
│   │   └── main.py                 # FastAPI application & static asset server
│   ├── config/
│   │   └── allowed_users.json      # Dynamic authorized users configuration
│   ├── requirements.txt            # Python dependencies
│   ├── run_backend.py              # Backend runner script
│   └── .env.example                # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, Sidebar, Badges, Voice
│   │   ├── pages/                  # Dashboard, TutorChat, GrammarLab, Vocab, etc.
│   │   ├── utils/                  # API client & Web Speech API helpers
│   │   ├── App.jsx                 # Route manager & state
│   │   ├── main.jsx                # React DOM mount
│   │   └── index.css               # Clean minimal design system stylesheet
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json                 # Vercel SPA configuration
├── desktop_shortcuts/              # Desktop launcher and quick links
├── start_all.bat                   # 1-Click launcher batch script
└── README.md
```

---

## 🌐 5. Deployment Guide

### Deploy Frontend to Vercel
1. Set the root directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: Set `VITE_API_URL` to your backend URL (e.g., `https://your-backend.onrender.com/api`).

### Deploy Backend to Render, Railway, or VPS
1. Set build command: `pip install -r requirements.txt`
2. Set start command: `python run_backend.py`
3. Environment variables: `MAX_ALLOWED_USERS=2`, `JWT_SECRET=your-secret-key`.
