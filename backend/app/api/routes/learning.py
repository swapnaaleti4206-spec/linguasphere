import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.core.security import get_current_user
from app.services.ai_service import ai_tutor
from app.database.db import query_all, query_one, execute_commit

router = APIRouter(prefix="/learning", tags=["Multilingual Learning AI"])

# --- Request Models ---
class ChatMessageRequest(BaseModel):
    session_id: str
    message: str
    level: str = "intermediate"
    language: str = "english"
    english_only: bool = True
    mode: str = "tutor"

class GrammarCheckRequest(BaseModel):
    text: str
    language: str = "english"
    save_mistakes: bool = True

class SaveVocabRequest(BaseModel):
    word: str
    language: str = "english"
    phonetic: Optional[str] = ""
    part_of_speech: Optional[str] = ""
    definition: str
    example: str
    difficulty: str = "intermediate"

class SpeakingTurnRequest(BaseModel):
    mode: str
    topic: str
    user_transcript: str
    language: str = "english"
    turn_count: int = 1

class WritingAssistRequest(BaseModel):
    task_type: str
    user_input: str
    language: str = "english"
    tone: str = "formal"

class CompleteTaskRequest(BaseModel):
    task_name: str
    language: str = "english"
    score: Optional[float] = 100.0

# --- Endpoints ---

@router.post("/chat")
async def chat_with_tutor_endpoint(req: ChatMessageRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    history_rows = await query_all(
        "SELECT role, content FROM chat_history WHERE user_id = ? AND session_id = ? ORDER BY id DESC LIMIT 6",
        (user_id, req.session_id)
    )
    context_history = list(reversed([{"role": r["role"], "content": r["content"]} for r in history_rows]))

    tutor_result = await ai_tutor.chat_with_tutor(
        user_message=req.message,
        history=context_history,
        level=req.level,
        language=req.language,
        mode=req.mode
    )

    await execute_commit(
        "INSERT INTO chat_history (user_id, session_id, language, mode, role, content, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user_id, req.session_id, req.language, req.mode, "user", req.message, "{}")
    )

    metadata_str = json.dumps({
        "corrections": tutor_result.get("corrections", []),
        "suggestions": tutor_result.get("suggestions", []),
        "language": req.language
    })
    await execute_commit(
        "INSERT INTO chat_history (user_id, session_id, language, mode, role, content, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user_id, req.session_id, req.language, req.mode, "assistant", tutor_result["response"], metadata_str)
    )

    for c in tutor_result.get("corrections", []):
        await execute_commit(
            """
            INSERT INTO grammar_mistakes (user_id, language, original_text, corrected_text, explanation, category)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, req.language, c.get("original", ""), c.get("correction", ""), c.get("explanation", ""), c.get("category", "Grammar"))
        )

    return {
        "reply": tutor_result["response"],
        "corrections": tutor_result.get("corrections", []),
        "suggestions": tutor_result.get("suggestions", []),
        "language": req.language,
        "session_id": req.session_id
    }

@router.get("/telugu-quizzes")
def get_telugu_quizzes(language: str = "english"):
    """Returns two-way sentence reading & translation quizzes between Target Language and Telugu."""
    return ai_tutor.get_telugu_translation_quizzes(language=language)

@router.post("/complete-task")
async def complete_task_and_award_streak(req: CompleteTaskRequest, current_user: dict = Depends(get_current_user)):
    """
    Awards streak and lesson counts in real-time when user completes a task/quiz.
    """
    user_id = current_user["id"]
    today_str = datetime.date.today().isoformat()
    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    stats = await query_one("SELECT * FROM learning_stats WHERE user_id = ?", (user_id,))
    current_streak = stats.get("streak_days", 0) if stats else 0
    last_active = stats.get("last_active_date") if stats else None

    # Calculate real streak
    if last_active == today_str:
        # Already active today, maintain streak
        new_streak = max(1, current_streak)
    elif last_active == yesterday_str:
        # Consecutive day!
        new_streak = current_streak + 1
    else:
        # First day or streak broke
        new_streak = 1

    await execute_commit(
        """
        UPDATE learning_stats 
        SET streak_days = ?, lessons_completed = lessons_completed + 1, last_active_date = ?, active_language = ?
        WHERE user_id = ?
        """,
        (new_streak, today_str, req.language, user_id)
    )

    # Save to practice session
    await execute_commit(
        """
        INSERT INTO practice_sessions (user_id, language, mode, topic, level, score, feedback)
        VALUES (?, ?, 'quiz', ?, 'intermediate', ?, 'Task completed successfully')
        """,
        (user_id, req.language, req.task_name, req.score)
    )

    updated_stats = await query_one("SELECT streak_days, lessons_completed FROM learning_stats WHERE user_id = ?", (user_id,))

    return {
        "status": "success",
        "message": f"🎉 Task '{req.task_name}' completed! You earned a {new_streak}-day streak!",
        "streak_days": updated_stats["streak_days"],
        "lessons_completed": updated_stats["lessons_completed"]
    }

@router.post("/grammar-check")
async def check_grammar_endpoint(req: GrammarCheckRequest, current_user: dict = Depends(get_current_user)):
    analysis = ai_tutor.analyze_grammar(req.text, language=req.language)
    user_id = current_user["id"]

    if req.save_mistakes:
        for c in analysis.get("corrections", []):
            await execute_commit(
                """
                INSERT INTO grammar_mistakes (user_id, language, original_text, corrected_text, explanation, category, rule_name)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, req.language, c.get("original", ""), c.get("correction", ""), c.get("explanation", ""), c.get("category", "Grammar"), "Rule Analysis")
            )

    return analysis

@router.get("/vocabulary")
async def get_vocabulary(language: str = "english", level: str = "all", current_user: dict = Depends(get_current_user)):
    curated = ai_tutor.get_vocabulary_words(language=language, level=level)
    saved_rows = await query_all(
        "SELECT * FROM vocabulary WHERE user_id = ? AND language = ? ORDER BY id DESC",
        (current_user["id"], language)
    )
    return {
        "curated": curated,
        "saved": saved_rows,
        "language": language,
        "total_saved": len(saved_rows)
    }

@router.post("/vocabulary/save")
async def save_vocabulary_word(req: SaveVocabRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    await execute_commit(
        """
        INSERT INTO vocabulary (user_id, language, word, phonetic, part_of_speech, definition, example, difficulty, mastery_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """,
        (user_id, req.language, req.word, req.phonetic, req.part_of_speech, req.definition, req.example, req.difficulty)
    )
    return {"status": "success", "message": f"Saved '{req.word}' to your personal vocabulary bank!"}

@router.get("/daily-practice")
async def get_daily(language: str = "english", level: str = "intermediate"):
    challenge = ai_tutor.get_daily_practice(language=language, level=level)
    return challenge

@router.get("/pronunciation")
async def get_pronunciation(word: str = "comfortable", language: str = "english"):
    return ai_tutor.get_pronunciation_guide(word, language=language)

@router.post("/speaking-simulation")
async def simulate_speaking(req: SpeakingTurnRequest, current_user: dict = Depends(get_current_user)):
    result = await ai_tutor.simulate_speaking_turn(
        mode=req.mode,
        topic=req.topic,
        user_transcript=req.user_transcript,
        language=req.language,
        turn_count=req.turn_count
    )

    user_id = current_user["id"]
    await execute_commit(
        """
        INSERT INTO practice_sessions (user_id, language, mode, topic, level, score, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (user_id, req.language, req.mode, req.topic, "intermediate", result["score"], result["feedback"])
    )

    return result

@router.post("/writing-assist")
def assist_writing_endpoint(req: WritingAssistRequest):
    return ai_tutor.assist_writing(task_type=req.task_type, user_input=req.user_input, tone=req.tone, language=req.language)
