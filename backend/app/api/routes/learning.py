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
    language: str = "english" # 'english', 'german', 'korean'
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
    mode: str # 'interview', 'discussion', 'public_speaking', 'casual'
    topic: str
    user_transcript: str
    language: str = "english"
    turn_count: int = 1

class WritingAssistRequest(BaseModel):
    task_type: str # 'email', 'resume', 'linkedin', 'story'
    user_input: str
    language: str = "english"
    tone: str = "formal"

class WritingEvaluateRequest(BaseModel):
    text: str
    language: str = "english"
    prompt: Optional[str] = ""
    task_type: str = "essay"

# --- Endpoints ---

@router.post("/chat")
async def chat_with_tutor_endpoint(req: ChatMessageRequest, current_user: dict = Depends(get_current_user)):
    """Interactive AI Tutor Chat for English, German, and Korean."""
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

    await execute_commit(
        "UPDATE learning_stats SET lessons_completed = lessons_completed + 1, active_language = ? WHERE user_id = ?",
        (req.language, user_id)
    )

    return {
        "reply": tutor_result["response"],
        "corrections": tutor_result.get("corrections", []),
        "suggestions": tutor_result.get("suggestions", []),
        "language": req.language,
        "session_id": req.session_id
    }

@router.get("/chat/history")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    rows = await query_all(
        "SELECT id, role, content, language, metadata_json, created_at FROM chat_history WHERE user_id = ? AND session_id = ? ORDER BY id ASC",
        (current_user["id"], session_id)
    )
    for r in rows:
        if r.get("metadata_json"):
            try:
                r["metadata"] = json.loads(r["metadata_json"])
            except:
                r["metadata"] = {}
    return rows

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
    await execute_commit(
        "UPDATE learning_stats SET words_learned = words_learned + 1 WHERE user_id = ?",
        (user_id,)
    )
    return {"status": "success", "message": f"Saved '{req.word}' to your personal vocabulary bank!"}

@router.get("/daily-practice")
async def get_daily(language: str = "english", level: str = "intermediate", current_user: dict = Depends(get_current_user)):
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
        (user_id, req.language, req.mode, req.topic, current_user.get("level", "intermediate"), result["score"], result["feedback"])
    )

    return result

@router.post("/writing-assist")
def assist_writing_endpoint(req: WritingAssistRequest):
    return ai_tutor.assist_writing(task_type=req.task_type, user_input=req.user_input, tone=req.tone, language=req.language)
