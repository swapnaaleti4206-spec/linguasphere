import os
import re
import json
import random
import requests
from app.core.config import OPENAI_API_KEY, GROQ_API_KEY, GEMINI_API_KEY

class MultilingualAIService:
    """
    Intelligent Multilingual Learning AI Engine for:
    - English, German, and Korean
    - Telugu Translation Quizzes (Two-way: Target Language <-> Telugu)
    """

    def __init__(self):
        self.openai_key = OPENAI_API_KEY.strip() if OPENAI_API_KEY else None
        self.groq_key = GROQ_API_KEY.strip() if GROQ_API_KEY else None
        self.gemini_key = GEMINI_API_KEY.strip() if GEMINI_API_KEY else None

    def _call_external_llm(self, system_prompt: str, user_prompt: str) -> str | None:
        if self.groq_key:
            try:
                headers = {"Authorization": f"Bearer {self.groq_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                    "temperature": 0.7,
                    "max_tokens": 1200
                }
                resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=12)
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[AI Service] Groq error: {e}")

        if self.openai_key:
            try:
                headers = {"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                    "temperature": 0.7,
                    "max_tokens": 1200
                }
                resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=12)
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[AI Service] OpenAI error: {e}")

        return None

    # =========================================================================
    # 1. AI Tutor Chat (Multilingual: English, German, Korean)
    # =========================================================================
    async def chat_with_tutor(
        self,
        user_message: str,
        history: list[dict],
        level: str = "intermediate",
        language: str = "english",
        mode: str = "tutor"
    ) -> dict:
        lang_names = {"english": "English", "german": "German (Deutsch)", "korean": "Korean (한국어)"}
        target_lang = lang_names.get(language.lower(), "English")

        system_prompt = (
            f"You are LinguaSphere AI, a world-class language tutor specializing in {target_lang}. "
            f"The learner's proficiency is '{level}'.\n"
            f"1. Respond naturally in {target_lang}, adapted to '{level}' level.\n"
            f"2. Provide an English or Telugu translation hint if helpful.\n"
            f"3. Kindly point out any grammar mistakes in a 'Grammar Tip'.\n"
            f"4. Propose 1 natural phrase improvement."
        )

        external = self._call_external_llm(system_prompt, f"History: {history}\nLearner: {user_message}")
        if external:
            grammar_check = self.analyze_grammar(user_message, language=language)
            return {
                "response": external,
                "corrections": grammar_check.get("corrections", []),
                "suggestions": grammar_check.get("improvements", []),
                "language": language,
                "level": level
            }

        return self._local_multilingual_tutor(user_message, level, language)

    def _local_multilingual_tutor(self, text: str, level: str, language: str) -> dict:
        lower = text.lower().strip()
        grammar = self.analyze_grammar(text, language=language)

        if language == "german":
            if any(w in lower for w in ["hallo", "guten tag", "hi", "servus"]):
                reply = (
                    "Hallo Swapna! Willkommen beim LinguaSphere Deutsch-Tutor. 🇩🇪 "
                    "Wie geht es dir heute? Worüber möchtest du sprechen oder welche Grammatikregel möchtest du üben?"
                )
            else:
                reply = (
                    "Sehr gut ausgedrückt! Auf Deutsch ist die Satzstellung besonders wichtig. "
                    "Um noch natürlicher zu klingen, könntest du 'außerdem' oder 'meiner Meinung nach' einbauen. "
                    "Was denkst du darüber?"
                )
        elif language == "korean":
            if any(w in text for w in ["안녕", "안녕하세요", "반가워"]):
                reply = (
                    "안녕하세요, 스왑나(Swapna)님! 링구아스피어 AI 한국어 튜터입니다. 🇰🇷 "
                    "오늘 기분이 어떠세요? 한국어 대화, 문법, 또는 일상 표현 중 어떤 것을 연습하고 싶으신가요?"
                )
            else:
                reply = (
                    "정말 잘 말씀하셨어요! 한국어에서는 존댓말과 적절한 조사(은/는, 이/가, 을/를)의 사용이 매우 중요합니다. "
                    "다음에는 어떤 일상 표현이나 질문을 연습해 볼까요?"
                )
        else: # English
            if any(w in lower for w in ["hello", "hi", "hey", "good morning"]):
                reply = (
                    "Hello Swapna! Welcome to your LinguaSphere AI English Studio. 🌟 "
                    "How are you doing today? We can practice conversation, grammar, interview preparation, or translation quizzes!"
                )
            else:
                reply = (
                    "That's a thoughtful point! Your sentence structure is coming along nicely. "
                    "To sound even more articulate, try connecting ideas using transition phrases like 'Furthermore' or 'In my perspective'. "
                    "Could you elaborate a bit more on that?"
                )

        return {
            "response": reply,
            "corrections": grammar.get("corrections", []),
            "suggestions": grammar.get("improvements", []),
            "language": language,
            "level": level
        }

    # =========================================================================
    # 2. Grammar Correction & Sentence Improvement Lab
    # =========================================================================
    def analyze_grammar(self, text: str, language: str = "english") -> dict:
        corrections = []
        improvements = []
        corrected_text = text
        score = 95.0

        if language == "german":
            rules = [
                (r"\bich bin gut\b", "mir geht es gut", "In German, say 'Mir geht es gut' instead of 'Ich bin gut'.", "Idiomatic Usage"),
                (r"\bdas wetter ist gut heute\b", "Das Wetter ist heute gut", "Time expressions ('heute') usually precede the predicate adjective ('gut').", "Word Order"),
                (r"\bin 2026\b", "im Jahr 2026 / 2026", "In German, write years bare ('2026') or as 'im Jahr 2026'.", "Preposition Usage")
            ]
            for pat, rep, exp, cat in rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 12.0
                    corrections.append({"original": pat, "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)
            improvements.append("Use German modal particles like 'doch', 'mal', or 'ja' for natural cadence.")

        elif language == "korean":
            if "나는 학생" in text and "입니다" not in text and "이야" not in text:
                score -= 10.0
                corrections.append({
                    "original": "나는 학생",
                    "correction": "저는 학생입니다 (Formal) / 나는 학생이야 (Casual)",
                    "explanation": "Korean sentences need a copula predicate like 이다/입니다.",
                    "category": "Sentence Ending"
                })
                corrected_text = text.replace("나는 학생", "저는 학생입니다")
            improvements.append("Pay close attention to Topic particles (은/는) vs Subject particles (이/가).")

        else: # English
            rules = [
                (r"\bi is\b", "I am", "Subject-verb agreement: 'I' takes 'am'.", "Subject-Verb Agreement"),
                (r"\byou is\b", "you are", "Subject-verb agreement: 'you' takes 'are'.", "Subject-Verb Agreement"),
                (r"\bhe have\b", "he has", "Third-person singular: 'he' takes 'has'.", "Verb Agreement"),
                (r"\bshe have\b", "she has", "Third-person singular: 'she' takes 'has'.", "Verb Agreement"),
                (r"\bdid went\b", "did go", "Past simple auxiliary 'did' takes base verb 'go'.", "Double Past Tense"),
                (r"\ba apple\b", "an apple", "Use indefinite article 'an' before vowel sounds.", "Article Usage"),
                (r"\bdepends of\b", "depends on", "Preposition collocation: 'depend' takes 'on'.", "Collocation")
            ]
            for pat, rep, exp, cat in rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 10.0
                    corrections.append({"original": pat, "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)

            if "very good" in text.lower():
                improvements.append("Elevate 'very good' with 'exceptional', 'outstanding', or 'superb'.")

        score = max(50.0, min(100.0, score))
        return {
            "original_text": text,
            "corrected_text": corrected_text,
            "score": round(score, 1),
            "corrections": corrections,
            "improvements": improvements,
            "language": language
        }

    # =========================================================================
    # 3. Telugu Translation Quizzes (Target Language <-> Telugu)
    # =========================================================================
    def get_telugu_translation_quizzes(self, language: str = "english") -> list[dict]:
        """
        Two-way translation quizzes between Target Language and Telugu (తెలుగు):
        1) Read Sentence in Target Language -> Translate into Telugu
        2) Read Telugu Sentence -> Translate into Target Language
        """
        quizzes = {
            "english": [
                {
                    "id": "te-en-1",
                    "direction": "to_telugu",
                    "direction_title": "Read English → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "I am learning a new language with great enthusiasm.",
                    "telugu_sentence": "నేను ఎంతో ఉత్సాహంతో కొత్త భాషను నేర్చుకుంటున్నాను.",
                    "options": [
                        "నేను నిన్న మార్కెట్‌కు వెళ్లాను.",
                        "నేను ఎంతో ఉత్సాహంతో కొత్త భాషను నేర్చుకుంటున్నాను.",
                        "నాకు ఈ పుస్తకం చదవడం ఇష్టం లేదు.",
                        "వారు రేపు మా ఇంటికి వస్తారు."
                    ],
                    "correct_index": 1,
                    "explanation": "'I am learning' అంటే 'నేను నేర్చుకుంటున్నాను', 'with great enthusiasm' అంటే 'ఎంతో ఉత్సాహంతో'."
                },
                {
                    "id": "te-en-2",
                    "direction": "from_telugu",
                    "direction_title": "Read Telugu (తెలుగు చదవండి) → Translate to English",
                    "source_sentence": "మీరు ఈ ప్రాజెక్ట్‌ను ఎప్పుడు పూర్తి చేస్తారు?",
                    "telugu_sentence": "మీరు ఈ ప్రాజెక్ట్‌ను ఎప్పుడు పూర్తి చేస్తారు?",
                    "options": [
                        "Where are you working on this project?",
                        "Why did you start this project?",
                        "When will you complete this project?",
                        "Who helped you with this project?"
                    ],
                    "correct_index": 2,
                    "explanation": "'ఎప్పుడు పూర్తి చేస్తారు?' అనేది భవిష్యత్తు ప్రశ్న కాబట్టి 'When will you complete this project?' సరైన ఆంగ్ల అనువాదం."
                },
                {
                    "id": "te-en-3",
                    "direction": "to_telugu",
                    "direction_title": "Read English → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "Consistency and dedication always lead to success.",
                    "telugu_sentence": "నిరంతర సాధన మరియు అంకితభావం ఎల్లప్పుడూ విజయానికి దారితీస్తాయి.",
                    "options": [
                        "నిరంతర సాధన మరియు అంకితభావం ఎల్లప్పుడూ విజయానికి దారితీస్తాయి.",
                        "విజయం సాధించడం చాలా కష్టమైన పని.",
                        "మనం సమయానికి ఆఫీసుకు చేరుకోవాలి.",
                        "ఈ రోజు వాతావరణం చాలా వేడిగా ఉంది."
                    ],
                    "correct_index": 0,
                    "explanation": "'Consistency' అంటే 'నిరంతర సాధన', 'dedication' అంటే 'అంకితభావం', 'lead to success' అంటే 'విజయానికి దారితీస్తాయి'."
                },
                {
                    "id": "te-en-4",
                    "direction": "from_telugu",
                    "direction_title": "Read Telugu (తెలుగు చదవండి) → Translate to English",
                    "source_sentence": "నాకు సహాయం చేసినందుకు మీకు చాలా ధన్యవాదాలు.",
                    "telugu_sentence": "నాకు సహాయం చేసినందుకు మీకు చాలా ధన్యవాదాలు.",
                    "options": [
                        "Could you please help me with this?",
                        "Thank you very much for helping me.",
                        "I am happy to assist you today.",
                        "We should help each other regularly."
                    ],
                    "correct_index": 1,
                    "explanation": "'నాకు సహాయం చేసినందుకు' = 'for helping me', 'చాలా ధన్యవాదాలు' = 'Thank you very much'."
                }
            ],
            "german": [
                {
                    "id": "te-de-1",
                    "direction": "to_telugu",
                    "direction_title": "Read German (Deutsch) → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "Guten Morgen! Wie geht es Ihnen heute?",
                    "telugu_sentence": "శుభోదయం! ఈరోజు మీరు ఎలా ఉన్నారు?",
                    "options": [
                        "శుభరాత్రి! రేపు కలుద్దాం.",
                        "శుభోదయం! ఈరోజు మీరు ఎలా ఉన్నారు?",
                        "ధన్యవాదాలు! మీ పేరు ఏమిటి?",
                        "నాకు జర్మన్ భాష రాదు."
                    ],
                    "correct_index": 1,
                    "explanation": "'Guten Morgen' = శుభోదయం, 'Wie geht es Ihnen heute?' = ఈరోజు మీరు ఎలా ఉన్నారు?"
                },
                {
                    "id": "te-de-2",
                    "direction": "from_telugu",
                    "direction_title": "Read Telugu (తెలుగు చదవండి) → Translate to German",
                    "source_sentence": "నేను జర్మన్ భాష నేర్చుకుంటున్నాను.",
                    "telugu_sentence": "నేను జర్మన్ భాష నేర్చుకుంటున్నాను.",
                    "options": [
                        "Ich spreche kein Deutsch.",
                        "Ich lerne die deutsche Sprache.",
                        "Wo wohnen Sie in Deutschland?",
                        "Ich reise morgen nach Berlin."
                    ],
                    "correct_index": 1,
                    "explanation": "'Ich lerne' = నేను నేర్చుకుంటున్నాను, 'die deutsche Sprache' = జర్మన్ భాష."
                }
            ],
            "korean": [
                {
                    "id": "te-ko-1",
                    "direction": "to_telugu",
                    "direction_title": "Read Korean (한국어) → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "만나서 반갑습니다. 저는 스왑나입니다.",
                    "telugu_sentence": "మిమ్మల్ని కలవడం సంతోషంగా ఉంది. నా పేరు స్왑న.",
                    "options": [
                        "ధన్యవాదాలు, మళ్ళీ కలుద్దాం.",
                        "మిమ్మల్ని కలవడం సంతోషంగా ఉంది. నా పేరు స్왑న.",
                        "ఈ రోజు చాలా చల్లగా ఉంది.",
                        "భోజనం చేశారా?"
                    ],
                    "correct_index": 1,
                    "explanation": "'만나서 반갑습니다' = మిమ్మల్ని కలవడం సంతోషంగా ఉంది, '저는 스왑나입니다' = నా పేరు స్왑న."
                },
                {
                    "id": "te-ko-2",
                    "direction": "from_telugu",
                    "direction_title": "Read Telugu (తెలుగు చదవండి) → Translate to Korean",
                    "source_sentence": "ఈరోజు వాతావరణం చాలా బాగుంది.",
                    "telugu_sentence": "ఈరోజు వాతావరణం చాలా బాగుంది.",
                    "options": [
                        "오늘 날씨가 정말 좋네요.",
                        "내일 비가 올 것 같아요.",
                        "어제는 날씨가 흐렸어요.",
                        "지금 몇 시인가요?"
                    ],
                    "correct_index": 0,
                    "explanation": "'오늘' = ఈరోజు, '날씨가' = వాతావరణం, '정말 좋네요' = చాలా బాగుంది."
                }
            ]
        }
        return quizzes.get(language.lower(), quizzes["english"])

    # =========================================================================
    # 4. Multilingual Vocabulary Bank
    # =========================================================================
    def get_vocabulary_words(self, language: str = "english", level: str = "all") -> list[dict]:
        banks = {
            "english": [
                {
                    "word": "Articulate",
                    "phonetic": "/ɑːrˈtɪk.jə.lət/",
                    "syllables": "ar-TIC-u-late",
                    "part_of_speech": "adjective",
                    "difficulty": "advanced",
                    "definition": "Having or showing the ability to speak fluently and coherently.",
                    "example": "Swapna delivered an articulate summary of the project.",
                    "collocations": ["articulate speaker", "articulate clearly"]
                },
                {
                    "word": "Resilience",
                    "phonetic": "/rɪˈzɪl.jəns/",
                    "syllables": "re-SIL-ience",
                    "part_of_speech": "noun",
                    "difficulty": "intermediate",
                    "definition": "The capacity to recover quickly from difficulties.",
                    "example": "Her resilience helped the team overcome obstacles.",
                    "collocations": ["demonstrate resilience", "remarkable resilience"]
                },
                {
                    "word": "Diligent",
                    "phonetic": "/ˈdɪl.ə.dʒənt/",
                    "syllables": "DIL-i-gent",
                    "part_of_speech": "adjective",
                    "difficulty": "beginner",
                    "definition": "Having or showing care and conscientiousness in work.",
                    "example": "Through diligent practice, you will master the language.",
                    "collocations": ["diligent student", "diligent effort"]
                }
            ],
            "german": [
                {
                    "word": "Die Zuverlässigkeit",
                    "phonetic": "/ˈt͡suːfɛɐ̯ˌlɛsɪçkaɪ̯t/",
                    "syllables": "Zu-ver-läs-sig-keit",
                    "part_of_speech": "noun (feminine)",
                    "difficulty": "intermediate",
                    "definition": "Reliability, dependability, trustworthiness.",
                    "example": "Ihre Zuverlässigkeit wird im Team sehr geschätzt.",
                    "collocations": ["hohe Zuverlässigkeit", "Zuverlässigkeit beweisen"]
                },
                {
                    "word": "Das Fingerspitzengefühl",
                    "phonetic": "/ˈfɪŋɐʃpɪt͡sn̩ɡəˌfyːl/",
                    "syllables": "Fin-ger-spit-zen-ge-fühl",
                    "part_of_speech": "noun (neuter)",
                    "difficulty": "advanced",
                    "definition": "Intuitive flair, tact, and delicate sensitivity.",
                    "example": "Für diese Verhandlung braucht man diplomatisches Fingerspitzengefühl.",
                    "collocations": ["diplomatisches Fingerspitzengefühl"]
                }
            ],
            "korean": [
                {
                    "word": "눈치 (Nunchi)",
                    "phonetic": "/nunt͡ɕʰi/",
                    "syllables": "Nun-chi",
                    "part_of_speech": "noun",
                    "difficulty": "intermediate",
                    "definition": "The subtle art and ability to gauge others' moods and context.",
                    "example": "그녀는 눈치가 빨라서 상황을 즉시 파악해요.",
                    "collocations": ["눈치가 빠르다", "눈치를 보다"]
                },
                {
                    "word": "인연 (In-yeon)",
                    "phonetic": "/in.jʌn/",
                    "syllables": "In-yeon",
                    "part_of_speech": "noun",
                    "difficulty": "advanced",
                    "definition": "Karmic tie, fateful destiny connecting people through time.",
                    "example": "우리가 만난 것도 깊은 인연입니다.",
                    "collocations": ["소중한 인연", "인연을 맺다"]
                }
            ]
        }
        lang_bank = banks.get(language.lower(), banks["english"])
        if level != "all":
            return [w for w in lang_bank if w["difficulty"] == level]
        return lang_bank

    # =========================================================================
    # 5. Speaking Simulation
    # =========================================================================
    async def simulate_speaking_turn(self, mode: str, topic: str, user_transcript: str, language: str = "english", turn_count: int = 1) -> dict:
        grammar = self.analyze_grammar(user_transcript, language=language)

        if language == "german":
            speaker = "Interviewer (Deutsch)"
            feedback = "Gute Aussprache und klare Satzstruktur."
            next_prompt = "Könnten Sie mir mehr über Ihre bisherigen Erfahrungen und Stärken erzählen?"
        elif language == "korean":
            speaker = "면접관 (Interviewer)"
            feedback = "자연스러운 존댓말 사용입니다."
            next_prompt = "이 프로젝트에서 본인이 가장 주도적으로 해결한 문제는 무엇이었나요?"
        else:
            speaker = "Interviewer (Hiring Lead)"
            feedback = "Clear, articulate tone. Structure key achievements with the STAR framework."
            next_prompt = "Could you share a specific challenge you overcame recently and what outcome you achieved?"

        return {
            "speaker": speaker,
            "feedback": feedback,
            "next_prompt": next_prompt,
            "grammar_analysis": grammar,
            "score": grammar["score"],
            "language": language
        }

    # =========================================================================
    # 6. Writing Assistants
    # =========================================================================
    def assist_writing(self, task_type: str, user_input: str, tone: str = "formal", language: str = "english") -> dict:
        if language == "german":
            improved = (
                f"Betreff: Wichtige Mitteilung bezüglich {user_input.strip()[:30]}\n\n"
                f"Sehr geehrte Damen und Herren,\n\n"
                f"ich wende mich an Sie, um Ihnen mitzuteilen, dass {user_input.strip()}.\n\n"
                f"Mit freundlichen Grüßen,\n"
                f"Swapna Aleti"
            )
        elif language == "korean":
            improved = (
                f"제목: {user_input.strip()[:20]} 관련 안내의 건\n\n"
                f"안녕하세요, 담당자님.\n\n"
                f"다름이 아니라 {user_input.strip()} 건과 관련하여 연락드립니다.\n\n"
                f"감사합니다.\n"
                f"알레티 스왑나(Swapna Aleti) 드림"
            )
        else:
            improved = (
                f"Subject: Professional Update: Regarding {user_input.strip()[:35]}\n\n"
                f"Dear Colleagues,\n\n"
                f"I am writing to formally communicate that {user_input.strip()}.\n\n"
                f"Warm regards,\n"
                f"Swapna Aleti"
            )

        return {
            "task_type": task_type,
            "tone": tone,
            "language": language,
            "improved_text": improved,
            "actionable_tips": [
                "Maintain polite greetings and clear sign-offs.",
                "Keep core messaging in the first paragraph."
            ]
        }

    # =========================================================================
    # 7. Pronunciation Guides
    # =========================================================================
    def get_pronunciation_guide(self, word: str, language: str = "english") -> dict:
        if language == "german":
            return {
                "word": word.capitalize(),
                "ipa": f"/{word.lower()}/",
                "syllables": "-".join([word[i:i+3] for i in range(0, len(word), 3)]),
                "stress": "Stress the root syllable.",
                "tongue_tips": "Shape lips tightly forward for umlauts like 'ü' and 'ö'.",
                "audio_text": word
            }
        elif language == "korean":
            return {
                "word": word,
                "ipa": f"/{word}/",
                "syllables": word,
                "stress": "Syllable-timed pitch accent.",
                "tongue_tips": "Distinguish between plain (ㄱ), aspirated (ㅋ), and tense (ㄲ).",
                "audio_text": word
            }
        else:
            return {
                "word": word.capitalize(),
                "ipa": f"/{word.lower()}/",
                "syllables": "-".join([word[i:i+3] for i in range(0, len(word), 3)]).upper(),
                "stress": "Place clear emphasis on the root syllable.",
                "tongue_tips": "Keep jaw relaxed and enunciate consonants crisply.",
                "audio_text": word
            }

ai_tutor = MultilingualAIService()
