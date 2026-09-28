import os
import re
import json
import random
import requests
from app.core.config import OPENAI_API_KEY, GROQ_API_KEY, GEMINI_API_KEY

class MultilingualAIService:
    """
    Intelligent Multilingual Learning AI Engine for:
    - English (US/UK)
    - German (Deutsch)
    - Korean (한국어)

    Provides conversational tutoring, grammar analysis, speech coaching,
    vocabulary building with Hanja/Romanization and German genders (der/die/das).
    """

    def __init__(self):
        self.openai_key = OPENAI_API_KEY.strip() if OPENAI_API_KEY else None
        self.groq_key = GROQ_API_KEY.strip() if GROQ_API_KEY else None
        self.gemini_key = GEMINI_API_KEY.strip() if GEMINI_API_KEY else None

    def _call_external_llm(self, system_prompt: str, user_prompt: str) -> str | None:
        """Attempts to call Groq or OpenAI if keys are present."""
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
            f"2. Provide an English translation hint or cultural context if helpful.\n"
            f"3. Kindly point out any grammar or particle/conjugation mistakes in a 'Grammar Tip'.\n"
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

        # Built-in Pedagogical responses
        return self._local_multilingual_tutor(user_message, level, language)

    def _local_multilingual_tutor(self, text: str, level: str, language: str) -> dict:
        lower = text.lower().strip()
        grammar = self.analyze_grammar(text, language=language)

        if language == "german":
            if any(w in lower for w in ["hallo", "guten tag", "hi", "servus"]):
                reply = (
                    "Hallo und herzlich willkommen! 🇩🇪 Ich bin dein LinguaSphere Deutsch-Tutor. "
                    "Wie geht es dir heute? Worüber möchtest du sprechen oder welche Grammatikregel möchtest du üben?"
                )
            else:
                reply = (
                    f"Sehr gut ausgedrückt! Auf Deutsch ist die Satzstellung (Verberst-, Verbzweitstellung) besonders wichtig. "
                    f"Um deine Ausdrucksweise noch natürlicher zu gestalten, könntest du Konnektoren wie 'außerdem', 'allerdings' oder 'meiner Meinung nach' einbauen. "
                    f"Was denkst du darüber?"
                )
        elif language == "korean":
            if any(w in text for w in ["안녕", "안녕하세요", "반가워", "반갑습니다"]):
                reply = (
                    "안녕하세요! 만나서 반갑습니다! 🇰🇷 저는 당신의 링구아스피어(LinguaSphere) 한국어 튜터입니다. "
                    "오늘 기분이 어떠세요? 한국어 대화, 문법, 또는 일상 표현 중 어떤 것을 연습하고 싶으신가요?"
                )
            else:
                reply = (
                    f"정말 잘 말씀하셨어요! 한국어에서는 존댓말(예: -아/어요, -습니다)과 적절한 조사(은/는, 이/가, 을/를)의 사용이 매우 중요합니다. "
                    f"더 자연스러운 표현으로 '제 생각에는...', '예를 들면...' 같은 연결어를 덧붙이면 훨씬 유창해 보입니다. "
                    f"다음에는 어떤 이야기를 더 해보고 싶으신가요?"
                )
        else: # English
            if any(w in lower for w in ["hello", "hi", "hey", "good morning"]):
                reply = (
                    "Hello and welcome! 🌟 I'm your LinguaSphere AI Tutor. "
                    "How are you doing today, and what communication goal or topic should we explore?"
                )
            else:
                reply = (
                    f"That's a thoughtful point! Your sentence structure is coming along nicely. "
                    f"To make your thought even more articulate, try adding transitional phrasing like 'In my assessment' or 'Furthermore'. "
                    f"Could you tell me more about that?"
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
                (r"\bich bin gut\b", "mir geht es gut", "In German, say 'Mir geht es gut' instead of 'Ich bin gut' (which implies being morally virtuous).", "Idiomatic Usage"),
                (r"\bdas wetter ist gut heute\b", "Das Wetter ist heute gut", "Time expressions ('heute') usually precede the predicate adjective ('gut').", "Word Order (TeKaMoLo)"),
                (r"\bfür was\b", "wofür", "Use the pronominal adverb 'wofür' instead of 'für was'.", "Pronominal Adverbs"),
                (r"\bin 2026\b", "im Jahr 2026 / 2026", "In German, write years either bare ('2026') or as 'im Jahr 2026', not 'in 2026'.", "Preposition Usage")
            ]
            for pat, rep, exp, cat in rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 12.0
                    corrections.append({"original": pat, "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)
            improvements.append("Use precise German modal particles like 'doch', 'mal', or 'ja' to sound authentic.")

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
            if "나의 이름은" in text:
                improvements.append("Instead of literal '나의 이름은', Koreans naturally say '제 이름은' or simply '저는 [이름]이에요'.")
            improvements.append("Pay close attention to Topic particles (은/는) vs Subject particles (이/가).")

        else: # English
            rules = [
                (r"\bi is\b", "I am", "Subject-verb agreement: 'I' takes 'am'.", "Subject-Verb Agreement"),
                (r"\byou is\b", "you are", "Subject-verb agreement: 'you' takes 'are'.", "Subject-Verb Agreement"),
                (r"\bhe have\b", "he has", "Third-person singular: 'he' takes 'has'.", "Verb Agreement"),
                (r"\bshe have\b", "she has", "Third-person singular: 'she' takes 'has'.", "Verb Agreement"),
                (r"\bdid went\b", "did go", "Past simple auxiliary 'did' takes base verb 'go'.", "Double Past Tense"),
                (r"\ba apple\b", "an apple", "Use indefinite article 'an' before vowel sounds.", "Article Usage"),
                (r"\bdepends of\b", "depends on", "Preposition collocation: 'depend' takes 'on'.", "Collocation"),
                (r"\bdiscuss about\b", "discuss", "'Discuss' is transitive and does not take 'about'.", "Redundant Preposition")
            ]
            for pat, rep, exp, cat in rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 10.0
                    corrections.append({"original": pat, "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)

            if "very good" in text.lower():
                improvements.append("Elevate 'very good' with 'exceptional', 'outstanding', or 'superb'.")
            if "i think" in text.lower():
                improvements.append("Try replacing 'I think' with 'In my view' or 'From my perspective'.")

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
    # 3. Multilingual Vocabulary Bank
    # =========================================================================
    def get_vocabulary_words(self, language: str = "english", level: str = "all") -> list[dict]:
        banks = {
            "english": [
                {
                    "word": "Articulate",
                    "phonetic": "/ɑːrˈtɪk.jə.lət/",
                    "syllables": "ar-TIC-u-late",
                    "part_of_speech": "adjective / verb",
                    "difficulty": "advanced",
                    "definition": "Having or showing the ability to speak fluently and coherently.",
                    "example": "She delivered an articulate summary of the project.",
                    "collocations": ["articulate speaker", "articulate clearly"]
                },
                {
                    "word": "Resilience",
                    "phonetic": "/rɪˈzɪl.jəns/",
                    "syllables": "re-SIL-ience",
                    "part_of_speech": "noun",
                    "difficulty": "intermediate",
                    "definition": "The capacity to recover quickly from difficulties.",
                    "example": "His resilience helped the team overcome setbacks.",
                    "collocations": ["demonstrate resilience", "remarkable resilience"]
                },
                {
                    "word": "Diligent",
                    "phonetic": "/ˈdɪl.ə.dʒənt/",
                    "syllables": "DIL-i-gent",
                    "part_of_speech": "adjective",
                    "difficulty": "beginner",
                    "definition": "Having or showing care and conscientiousness in work.",
                    "example": "Through diligent practice, Swapna mastered new concepts.",
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
                    "definition": "Intuitive flair, tact, delicate sensitivity in handling difficult situations.",
                    "example": "Für diese Verhandlung braucht man diplomatisches Fingerspitzengefühl.",
                    "collocations": ["diplomatisches Fingerspitzengefühl", "Fingerspitzengefühl beweisen"]
                },
                {
                    "word": "Die Gemütlichkeit",
                    "phonetic": "/ɡəˈmyːtlɪçkaɪ̯t/",
                    "syllables": "Ge-müt-lich-keit",
                    "part_of_speech": "noun (feminine)",
                    "difficulty": "beginner",
                    "definition": "A state of coziness, warmth, and friendly contentment.",
                    "example": "Das kleine Café strahlt echte Gemütlichkeit aus.",
                    "collocations": ["angenehme Gemütlichkeit", "Gemütlichkeit genießen"]
                }
            ],
            "korean": [
                {
                    "word": "눈치 (Nunchi)",
                    "phonetic": "/nunt͡ɕʰi/",
                    "syllables": "Nun-chi",
                    "part_of_speech": "noun",
                    "difficulty": "intermediate",
                    "definition": "The subtle art and ability to gauge others' moods, feelings, and social context.",
                    "example": "그녀는 눈치가 빨라서 상황을 즉시 파악해요 (She has quick nunchi and reads situations immediately).",
                    "collocations": ["눈치가 빠르다 (quick-witted)", "눈치를 보다 (sense mood)"]
                },
                {
                    "word": "인연 (In-yeon)",
                    "phonetic": "/in.jʌn/",
                    "syllables": "In-yeon",
                    "part_of_speech": "noun (Hanja: 因緣)",
                    "difficulty": "advanced",
                    "definition": "Karmic tie, fateful destiny connecting people through time.",
                    "example": "우리가 이렇게 만난 것도 깊은 인연입니다 (Our meeting like this is profound inyeon).",
                    "collocations": ["소중한 인연 (precious connection)", "인연을 맺다 (form connection)"]
                },
                {
                    "word": "감사합니다 (Gamsahamnida)",
                    "phonetic": "/kam.sa.ham.ni.da/",
                    "syllables": "Gam-sa-ham-ni-da",
                    "part_of_speech": "expression / phrase",
                    "difficulty": "beginner",
                    "definition": "Thank you (Formal, polite expression of gratitude).",
                    "example": "도와주셔서 진심으로 감사합니다 (Thank you sincerely for helping).",
                    "collocations": ["진심으로 감사합니다", "대단히 감사합니다"]
                }
            ]
        }

        lang_bank = banks.get(language.lower(), banks["english"])
        if level != "all":
            return [w for w in lang_bank if w["difficulty"] == level]
        return lang_bank

    # =========================================================================
    # 4. Daily Practice (Multilingual)
    # =========================================================================
    def get_daily_practice(self, language: str = "english", level: str = "intermediate") -> dict:
        if language == "german":
            return {
                "day_title": "Tägliche 5-Minuten Deutsch-Praxis",
                "idiom": {
                    "phrase": "Ich verstehe nur Bahnhof",
                    "meaning": "Literal: 'I only understand train station'. Meaning: It's all Greek to me / I don't understand anything.",
                    "example": "Wenn er über Quantenphysik spricht, verstehe ich nur Bahnhof!"
                },
                "grammar_puzzle": {
                    "question": "Welcher Artikel passt zu 'Mädchen'?",
                    "options": ["Der Mädchen", "Die Mädchen", "Das Mädchen"],
                    "correct_index": 2,
                    "explanation": "Diminutives ending in '-chen' (like Mädchen) are grammatically neuter (das)."
                },
                "dialogue_scenario": {
                    "context": "Im Café in Berlin",
                    "prompt": "Bestelle einen Cappuccino mit Hafermilch und frage nach dem WLAN-Passwort.",
                    "suggested_opening": "Könnte ich bitte einen Cappuccino mit Hafermilch bekommen? Und wie lautet das WLAN-Passwort?"
                },
                "sentence_builder": {
                    "words": ["heute", "Ich", "lerne", "fleißig", "Deutsch"],
                    "correct_order": "Ich lerne heute fleißig Deutsch."
                }
            }
        elif language == "korean":
            return {
                "day_title": "매일 5분 한국어 챌린지 (Daily Korean Challenge)",
                "idiom": {
                    "phrase": "식은 죽 먹기 (Sikeun juk meokgi)",
                    "meaning": "Like eating cold porridge — a piece of cake / very easy.",
                    "example": "오늘 한국어 퀴즈는 식은 죽 먹기였어요! (Today's Korean quiz was a piece of cake!)"
                },
                "grammar_puzzle": {
                    "question": "'선생님(Teacher)' 뒤에 오는 올바른 주격 조사는?",
                    "options": ["선생님이", "선생님가", "선생님를"],
                    "correct_index": 0,
                    "explanation": "받침(consonant ending 'ㅁ') 뒤에는 주격 조사 '이'가 붙습니다."
                },
                "dialogue_scenario": {
                    "context": "서울 카페에서 (At a Seoul Cafe)",
                    "prompt": "아이스 아메리카노 한 잔과 영수증을 정중하게 주문해보세요.",
                    "suggested_opening": "아이스 아메리카노 한 잔 부탁드립니다. 영수증도 같이 주세요."
                },
                "sentence_builder": {
                    "words": ["오늘", "저는", "한국어를", "열심히", "공부해요"],
                    "correct_order": "저는 오늘 한국어를 열심히 공부해요."
                }
            }
        else: # English
            return {
                "day_title": "Daily 5-Minute English Practice",
                "idiom": {
                    "phrase": "Hit the nail on the head",
                    "meaning": "Describe exactly what is causing a situation or problem.",
                    "example": "Swapna hit the nail on the head during the strategy meeting."
                },
                "grammar_puzzle": {
                    "question": "Which sentence correctly uses the present perfect continuous?",
                    "options": [
                        "I am working on this project since three months.",
                        "I have been working on this project for three months.",
                        "I had worked on this project since three months."
                    ],
                    "correct_index": 1,
                    "explanation": "Use 'have been working' + 'for' to express duration up to the present."
                },
                "dialogue_scenario": {
                    "context": "Workplace Collaboration",
                    "prompt": "Politely ask your colleague for feedback on your presentation outline.",
                    "suggested_opening": "Could you spare a few minutes to look over my presentation draft and share your thoughts?"
                },
                "sentence_builder": {
                    "words": ["would", "appreciate", "I", "your", "constructive", "feedback"],
                    "correct_order": "I would appreciate your constructive feedback."
                }
            }

    # =========================================================================
    # 5. Speaking Simulation
    # =========================================================================
    async def simulate_speaking_turn(self, mode: str, topic: str, user_transcript: str, language: str = "english", turn_count: int = 1) -> dict:
        grammar = self.analyze_grammar(user_transcript, language=language)

        if language == "german":
            speaker = "Interviewer / Gesprächspartner"
            feedback = "Gute Aussprache und klare Satzstruktur. Achte auf die korrekten Dativ- und Akkusativendungen."
            next_prompt = "Könnten Sie mir mehr über Ihre bisherigen Erfahrungen und Stärken erzählen?"
        elif language == "korean":
            speaker = "면접관 / 대화 파트너 (Interviewer)"
            feedback = "자연스러운 존댓말 사용입니다. 상황에 맞는 어휘 선택이 돋보입니다."
            next_prompt = "이 프로젝트에서 본인이 가장 주도적으로 해결한 문제는 무엇이었나요?"
        else: # English
            speaker = "Interviewer (Hiring Lead)"
            feedback = "Clear, articulate tone. Structure key achievements with the STAR framework (Situation, Task, Action, Result)."
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
                f"ich wende mich an Sie, um Ihnen mitzuteilen, dass {user_input.strip()}. "
                f"Für Rückfragen stehe ich Ihnen selbstverständlich jederzeit gerne zur Verfügung.\n\n"
                f"Mit freundlichen Grüßen,\n"
                f"Swapna Aleti"
            )
        elif language == "korean":
            improved = (
                f"제목: {user_input.strip()[:20]} 관련 안내 및 요청의 건\n\n"
                f"안녕하세요, 담당자님.\n\n"
                f"다름이 아니라 {user_input.strip()} 건과 관련하여 연락드립니다. "
                f"검토 후 문의사항이 있으시면 언제든지 편하게 말씀해 주시기 바랍니다.\n\n"
                f"감사합니다.\n"
                f"알레티 스왑나(Swapna Aleti) 드림"
            )
        else: # English
            improved = (
                f"Subject: Professional Update: Regarding {user_input.strip()[:35]}\n\n"
                f"Dear Colleagues,\n\n"
                f"I am writing to formally communicate that {user_input.strip()}. "
                f"Please let me know if you require any further documentation or clarification.\n\n"
                f"Thank you for your time and collaboration.\n\n"
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
                "Keep core messaging in the first paragraph.",
                "Proofread for regional professional etiquette."
            ]
        }

    # =========================================================================
    # 7. Pronunciation Guides
    # =========================================================================
    def get_pronunciation_guide(self, word: str, language: str = "english") -> dict:
        w_lower = word.strip().lower()
        if language == "german":
            return {
                "word": word.capitalize(),
                "ipa": f"/{word.lower()}/",
                "syllables": "-".join([word[i:i+3] for i in range(0, len(word), 3)]),
                "stress": "German words generally stress the root syllable (Stammbetonung).",
                "tongue_tips": "Shape lips tightly forward for umlauts like 'ü' [y] and 'ö' [ø]. Pronounce 'w' as English 'v'.",
                "audio_text": word
            }
        elif language == "korean":
            return {
                "word": word,
                "ipa": f"/{word}/",
                "syllables": word,
                "stress": "Korean is syllable-timed with pitch accents rather than heavy stress.",
                "tongue_tips": "Distinguish between plain (ㄱ, ㄷ, ㅂ), aspirated (ㅋ, ㅌ, ㅍ), and tense (ㄲ, ㄸ, ㅃ) consonants.",
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
