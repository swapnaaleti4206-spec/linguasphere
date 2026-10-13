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
    - Telugu Translation Quizzes & Cross-Lingual Explanations (Target Language <-> Telugu)
    - Comprehensive Linguistic Rule Engine (Duden German, NIIED Korean, CEFR English)
    """

    def __init__(self):
        self.openai_key = OPENAI_API_KEY.strip() if OPENAI_API_KEY else None
        self.groq_key = GROQ_API_KEY.strip() if GROQ_API_KEY else None
        self.gemini_key = GEMINI_API_KEY.strip() if GEMINI_API_KEY else None

    def _call_external_llm(self, system_prompt: str, user_prompt: str) -> str | None:
        # 1. Try Gemini if configured
        if self.gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_prompt}\n\nUser Question/Message: {user_prompt}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1000
                    }
                }
                resp = requests.post(url, json=payload, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
            except Exception as e:
                print(f"[AI Service] Gemini error: {e}")

        # 2. Try Groq if configured
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

        # 3. Try OpenAI if configured
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
        lang_names = {
            "english": "English",
            "german": "German (Deutsch)",
            "korean": "Korean (한국어)"
        }
        target_lang = lang_names.get(language.lower(), "English")

        system_prompt = (
            f"You are LinguaSphere AI, an empathetic, encouraging, and expert language tutor specializing in {target_lang}. "
            f"The learner's proficiency is '{level}'.\n"
            f"Guidelines:\n"
            f"1. Respond directly and helpfully in {target_lang} adapted to '{level}' level.\n"
            f"2. Provide Telugu or English translation hints for key concepts when helpful.\n"
            f"3. Provide polite, clear grammatical corrections and natural improvements.\n"
            f"4. Ask 1 engaging follow-up question to keep the learner practicing."
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

        return self._local_multilingual_tutor(user_message, level, language, history)

    def _local_multilingual_tutor(self, text: str, level: str, language: str, history: list[dict] = None) -> dict:
        """
        Comprehensive local pedagogical AI engine.
        Handles vocabulary, grammar correction, conversational practice, Telugu translations,
        and multilingual explanations (German, Korean, English).
        """
        raw_text = text.strip()
        grammar = self.analyze_grammar(raw_text, language=language)
        corrections = grammar.get("corrections", [])
        improvements = grammar.get("improvements", [])

        if language == "german":
            reply = self._handle_german_tutor(raw_text, level, grammar)
        elif language == "korean":
            reply = self._handle_korean_tutor(raw_text, level, grammar)
        else:
            reply = self._handle_english_tutor(raw_text, level, grammar)

        return {
            "response": reply,
            "corrections": corrections,
            "suggestions": improvements,
            "language": language,
            "level": level
        }

    # =========================================================================
    # GERMAN TUTOR ENGINE (Deutsch)
    # =========================================================================
    def _handle_german_tutor(self, text: str, level: str, grammar: dict) -> str:
        lower = text.lower()
        corrections = grammar.get("corrections", [])

        # 1. Corrections first if any critical grammar error detected
        if corrections:
            primary = corrections[0]
            return (
                f"Toller Versuch! Lass uns deinen deutschen Satz gemeinsam feilen: 🎯🇩🇪\n\n"
                f"**Satz-Korrektur:**\n"
                f"• Dein Satz: *\"{text}\"*\n"
                f"• Bessere Formulierung: **\"{grammar['corrected_text']}\"**\n\n"
                f"💡 **Grammatik-Erklärung ({primary['category']}):**\n"
                f"{primary['explanation']}\n\n"
                f"📌 **Telugu వివరణ (తెలుగు అర్థం):**\n"
                f"జర్మన్ భాషలో ఈ భావాన్ని చెప్పడానికి **\"{grammar['corrected_text']}\"** అనేది సరైన రూపం.\n\n"
                f"Möchtest du einen neuen Satz mit diesem Muster ausprobieren?"
            )

        # 2. Greetings
        if any(w in lower for w in ["hallo", "guten tag", "hi", "servus", "guten morgen", "guten abend", "moin"]):
            return (
                "Hallo! Herzlich willkommen im LinguaSphere Deutsch-Studio! 🇩🇪✨\n\n"
                "Wie geht es dir heute? (How are you doing today? / ఈ రోజు మీరు ఎలా ఉన్నారు?)\n\n"
                "Hier sind 4 praktische Dinge, die wir heute üben können:\n"
                "• 🗣️ **Alltagsgespräche (Daily Chat)** — z. B. Über das Wetter, Essen oder Hobbys sprechen.\n"
                "• 📖 **Deutsche Artikel (der, die, das)** — Lerne die Geheimnisse der Wortendungen.\n"
                "• 🔍 **Die 4 Fälle (Kasus)** — Nominativ, Akkusativ, Dativ & Genitiv verstehen.\n"
                "• 🇮🇳 **Deutsch ↔ Telugu Übersetzung** — Übersetze wichtige Ausdrücke.\n\n"
                "Worüber möchtest du heute sprechen? (What would you like to discuss?)"
            )

        # 3. How are you queries
        if any(w in lower for w in ["wie geht es dir", "wie geht's", "wie gehts", "wie geht es ihnen"]):
            return (
                "Mir geht es fantastisch, vielen Dank für die Nachfrage! 😊🇩🇪\n\n"
                "💡 **Wichtiger Lerntipp:**\n"
                "Im Deutschen sagt man auf die Frage 'Wie geht es dir?':\n"
                "• *\"Mir geht es gut!\"* (I am doing well / నాకు బాగానే ఉంది)\n"
                "⚠️ Vermeide *'Ich bin gut'*, denn das bedeutet eher 'I am good at something'.\n\n"
                "Und wie läuft dein Tag bisher? (And how is your day going?)"
            )

        # 4. Thank you
        if any(w in lower for w in ["danke", "vielen dank", "herzlichen dank"]):
            return (
                "Gerne geschehen! (You're very welcome! / మీకు స్వాగతం! ✨)\n\n"
                "Du machst wunderbare Fortschritte beim Deutschlernen.\n"
                "Hast du eine Frage zu einem bestimmten Wort oder möchtest du einen Satz bilden?"
            )

        # 5. Articles (der, die, das)
        if any(w in lower for w in ["artikel", "der die das", "geschlecht", "der", "die", "das"]):
            return (
                "🇩🇪 **Die goldenen Regeln für deutsche Artikel (Der, Die, Das):**\n\n"
                "1️⃣ **Maskulin (der):**\n"
                "   • Endungen: *-ling, -or, -ist, -ismus, -ant* (z. B. der Schmetterling, der Motor, der Optimismus).\n"
                "   • Tage, Monate und Jahreszeiten: *der Montag, der Januar, der Sommer*.\n\n"
                "2️⃣ **Feminin (die):**\n"
                "   • Endungen: *-ung, -heit, -keit, -schaft, -tion, -tät, -ik* (z. B. die Übung, die Freiheit, die Freundschaft, die Musik).\n"
                "   • Fast alle Blumen und Bäume: *die Rose, die Eiche*.\n\n"
                "3️⃣ **Neutral (das):**\n"
                "   • Endungen: *-chen, -lein, -um, -ment* (z. B. das Mädchen, das Fräulein, das Zentrum, das Dokument).\n"
                "   • Substantivierte Verben: *das Essen, das Leben*.\n\n"
                "💡 **Telugu Hint:** జర్మన్‌లో వస్తువుల లింగభేదం (Gender) వ్యాకరణపరమైనది. ప్రతి నామవాచకాన్ని దాని ఆర్టికల్‌తో కలిపి గుర్తుంచుకోవాలి.\n\n"
                "Möchtest du einen Beispielsatz mit einem dieser Wörter schreiben?"
            )

        # 6. Cases (Kasus: Akkusativ & Dativ)
        if any(w in lower for w in ["akkusativ", "dativ", "kasus", "fälle", "genitiv"]):
            return (
                "🇩🇪 **Die deutschen Fälle im Überblick (Cases Guide):**\n\n"
                "• **Nominativ (Subjekt):** Wer oder was handelt? (*Der Mann liest ein Buch*)\n"
                "• **Akkusativ (Direktes Objekt):** Wen oder was? (*Ich sehe **den** Mann / ein**en** Hund*)\n"
                "• **Dativ (Indirektes Objekt):** Wem? (*Ich helfe **dem** Mann / de**r** Frau*)\n\n"
                "📌 **Wichtige Präpositionen:**\n"
                "• Immer Akkusativ: *durch, für, gegen, ohne, um*\n"
                "• Immer Dativ: *aus, bei, mit, nach, seit, von, zu*\n\n"
                "Telugu వివరణ: తెలుగులో విభక్తులు (ద్వితీయ, తృతీయ విభక్తులు) ఉన్నట్లే, జర్మన్‌లో ఈ 4 కేసులు వాక్య నిర్మాణానికి అత్యంత కీలకం!\n\n"
                "Soll ich dir ein paar Übungsfragen dazu stellen?"
            )

        # 7. Word Order (Satzstellung / V2)
        if any(w in lower for w in ["satzstellung", "wortstellung", "verb position", "v2", "weil", "dass"]):
            return (
                "🇩🇪 **Deutsche Satzstellung (Word Order Mastery):**\n\n"
                "1️⃣ **Hauptsatz (Main Clause): Verb immer an Position 2!**\n"
                "   • *Heute **gehe** ich ins Kino.* (Time element first -> Verb still 2nd!)\n\n"
                "2️⃣ **Nebensatz (Subordinate Clause): Verb wandert ans Ende!**\n"
                "   • Konjunktionen wie *weil, dass, obwohl, wenn* schicken das Verb ans Satzende:\n"
                "   • *Ich lerne Deutsch, weil ich in Deutschland studieren **möchte**.*\n\n"
                "3️⃣ **Perfekt (Vergangenheit):**\n"
                "   • Hilfsverb (haben/sein) an Position 2, Partizip II am Ende:\n"
                "   • *Ich **habe** gestern ein Buch **gelesen**.*\n\n"
                "Versuche doch einmal einen Satz mit 'weil' zu bilden!"
            )

        # 8. Telugu translations or inquiries in German
        if any(w in lower for w in ["telugu", "übersetzung", "bedeutung", "was bedeutet", "was heisst", "was heißt"]):
            return (
                "🇩🇪 ↔ 🇮🇳 **Deutsch-Telugu Sprachbrücke (Bilingual Reference):**\n\n"
                "• **'Guten Morgen, wie geht es Ihnen?'**\n"
                "  → శుభోదయం, మీరు ఎలా ఉన్నారు?\n"
                "• **'Ich lerne jeden Tag fleißig Deutsch.'**\n"
                "  → నేను ప్రతిరోజూ శ్రద్ధగా జర్మన్ నేర్చుకుంటున్నాను.\n"
                "• **'Könnten Sie mir bitte helfen?'**\n"
                "  → దయచేసి నాకు సహాయం చేయగలరా?\n"
                "• **'Alles Gute zum Geburtstag!'**\n"
                "  → పుట్టినరోజు శుభాకాంక్షలు!\n\n"
                "Welchen deutschen oder Telugu Satz möchtest du als Nächstes übersetzen?"
            )

        # 9. Conversational German response
        snippets = [s.strip() for s in re.split(r"[.?!,]", text) if len(s.strip()) > 2]
        key_snippet = f"\"{snippets[0]}\"" if snippets else "deinen Gedanken"

        return (
            f"Sehr schön formuliert! Dein Ausdruck über {key_snippet} klingt schon sehr lebendig. 🇩🇪✨\n\n"
            f"💡 **Tipp für '{level}' Niveau:**\n"
            f"Um deinen Satz noch muttersprachlicher klingen zu lassen, kannst du Modalpartikeln wie *'mal'*, *'doch'* oder *'ja'* einbauen. "
            f"Zum Beispiel: *\"Das ist ja wirklich eine interessante Idee!\"*\n\n"
            f"Erzähl mir gerne mehr dazu: Was denkst du als Nächstes darüber?"
        )

    # =========================================================================
    # KOREAN TUTOR ENGINE (한국어)
    # =========================================================================
    def _handle_korean_tutor(self, text: str, level: str, grammar: dict) -> str:
        lower = text.lower()
        corrections = grammar.get("corrections", [])

        # 1. Corrections first if any critical grammar error detected
        if corrections:
            primary = corrections[0]
            return (
                f"정말 훌륭한 시도예요! 한국어 문장을 함께 다듬어 볼까요? 🎯🇰🇷\n\n"
                f"**문장 교정 및 자연스러운 표현:**\n"
                f"• 작성하신 문장: *\"{text}\"*\n"
                f"• 추천 문장: **\"{grammar['corrected_text']}\"**\n\n"
                f"💡 **문법 설명 ({primary['category']}):**\n"
                f"{primary['explanation']}\n\n"
                f"📌 **Telugu వివరణ (తెలుగు అర్థం):**\n"
                f"కొరియన్ భాషలో గౌరవప్రదంగా మాట్లాడేటప్పుడు **\"{grammar['corrected_text']}\"** అనేది సరైన మరియు సహజమైన రూపం.\n\n"
                f"이 패턴을 사용해서 다른 문장도 만들어 보시겠어요?"
            )

        # 2. Greetings
        if any(w in lower for w in ["안녕", "안녕하세요", "안녕하십니까", "hi", "hello", "좋은 아침", "반가워요", "반갑습니다"]):
            return (
                "안녕하세요! 링구아스피어 한국어 학습 스튜디오에 오신 것을 진심으로 환영합니다! 🇰🇷✨\n\n"
                "오늘 하루는 어떠셨나요? (How was your day? / ఈ రోజు మీ రోజు ఎలా గడిచింది?)\n\n"
                "오늘 함께 연습해 볼 흥미로운 주제들입니다:\n"
                "• 🗣️ **일상 한국어 대화 (Daily Conversation)** — 날씨, 음식, 취미 이야기 나누기.\n"
                "• 📝 **조사 마스터 (Particles)** — 은/는(주제) vs 이/가(주격), 을/를(목적격) 차이점.\n"
                "• 🌸 **존댓말과 높임말 (Polite Speech)** — 해요체(-아요/어요)와 하십시오체(-습니다) 익히기.\n"
                "• 🇮🇳 **한국어 ↔ 텔루구어 번역 (Translation)** — 핵심 단어와 관용구 배우기.\n\n"
                "어떤 주제부터 먼저 이야기해 볼까요? 편하게 말씀해 주세요!"
            )

        # 3. How are you queries
        if any(w in lower for w in ["잘 지냈어요", "어떻게 지내세요", "어떠세요", "식사하셨어요", "밥 먹었어요"]):
            return (
                "네, 저는 아주 활기차게 잘 지내고 있습니다! 물어봐 주셔서 감사해요. 😊🇰🇷\n\n"
                "💡 **한국 문화 꿀팁 (K-Culture Insight):**\n"
                "한국에서는 친근한 안부 인사로 *\"식사하셨어요?\"* 또는 *\"밥 먹었어요?\"*(Did you eat?)라고 자주 묻습니다. "
                "이는 실제로 식사 여부를 묻는 것뿐만 아니라 상대방을 챙기는 따뜻한 인사입니다.\n\n"
                "스왑나님은 오늘 식사 맛있게 하셨나요? 오늘 무엇을 드셨는지 말씀해 주세요!"
            )

        # 4. Thank you
        if any(w in lower for w in ["감사", "고마워", "고맙습니다", "감사합니다", "gamsahamnida"]):
            return (
                "천만에요! 별말씀을요! (You're very welcome! / మీకు స్వాగతం! 🌟)\n\n"
                "한국어 실력이 날마다 쑥쑥 늘고 있어요.\n"
                "새로 배우고 싶은 한국어 단어나 문장이 있으신가요?"
            )

        # 5. Korean Particles (조사: 은/는, 이/가, 을/를)
        if any(w in lower for w in ["은/는", "이/가", "을/를", "조사", "particle", "은", "는", "이", "가"]):
            return (
                "🇰🇷 **한국어 핵심 조사 완벽 정리 (Korean Particles Guide):**\n\n"
                "1️⃣ **은 / 는 (주제 조사 - Topic Marker):**\n"
                "   • 문장의 '큰 주제'를 معرفی하거나 다른 것과의 '대조'를 나타냅니다.\n"
                "   • 받침 있음: **은** (선생님은) / 받침 없음: **는** (저는)\n"
                "   • 예: *저는 학생입니다.* (Speaking of me, I am a student.)\n\n"
                "2️⃣ **이 / 가 (주격 조사 - Subject Marker):**\n"
                "   • 새로운 정보나 특정 행위의 주체를 '지목'할 때 씁니다.\n"
                "   • 받침 있음: **이** (비가, 책이) / 받침 없음: **가** (날씨가)\n"
                "   • 예: *비가 와요.* (Rain is falling.)\n\n"
                "3️⃣ **을 / 를 (목적격 조사 - Object Marker):**\n"
                "   • 행동의 직접적인 대상(목적어)에 붙입니다.\n"
                "   • 받침 있음: **을** (밥을 먹어요) / 받침 없음: **를** (사과를 좋아해요)\n\n"
                "💡 **Telugu Hint:** తెలుగులో 'ను/ని' (ద్వితీయా విభక్తి) లాగే కొరియన్‌లో '을/를' వాడతారు.\n\n"
                "이 조사들을 넣어서 문장 하나를 만들어 보시겠어요?"
            )

        # 6. Polite Speech & Endings (존댓말, 높임말)
        if any(w in lower for w in ["존댓말", "반말", "높임말", "해요체", "습니다", "아요", "어요"]):
            return (
                "🇰🇷 **한국어 존댓말 체계 (Polite & Formal Speech Styles):**\n\n"
                "1️⃣ **해요체 (Informal Polite - 가장 널리 쓰임):**\n"
                "   • 일상 대화에서 어른이나 동료에게 정중하게 말할 때 사용합니다.\n"
                "   • 양성모음 (ㅏ, ㅗ) 뒤: **-아요** (가요, 봐요)\n"
                "   • 음성모음 (ㅓ, ㅜ, ㅣ 등) 뒤: **-어요** (먹어요, 마셔요)\n"
                "   • 하다 동사: **-해요** (공부해요, 운동해요)\n\n"
                "2️⃣ **하십시오체 (Formal Polite - 공식적인 자리, 뉴스, 면접):**\n"
                "   • 받침 있음: **-습니다** (반갑습니다, 먹습니다)\n"
                "   • 받침 없음: **-ㅂ니다** (감사합니다, 갑니다)\n\n"
                "3️⃣ **겸칭 (Humble Pronoun):**\n"
                "   • 존댓말을 쓸 때는 '나'(na) 대신 반드시 **'저'(jeo)**를 사용해야 예의가 바릅니다.\n"
                "   • 예: *저도 그렇게 생각해요.*\n\n"
                "이해가 쏙쏙 되셨나요? 평소 자주 쓰시는 문장을 존댓말로 바꿔볼까요?"
            )

        # 7. Telugu & Korean Translations
        if any(w in lower for w in ["telugu", "텔루구", "번역", "뜻", "무슨 뜻", "의미"]):
            return (
                "🇰🇷 ↔ 🇮🇳 **한국어-텔루구어 실용 표현 사전:**\n\n"
                "• **'만나서 반갑습니다. 저는 스왑나입니다.'**\n"
                "  → మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది. నా పేరు స్왑న.\n"
                "• **'오늘 날씨가 정말 화창하고 좋네요.'**\n"
                "  → ఈ రోజు వాతావరణం ఎంతో ఆహ్లాదకరంగా మరియు బాగుంది.\n"
                "• **'한국어를 열심히 공부하고 있어요.'**\n"
                "  → నేను ఎంతో శ్రద్ధగా కొరియన్ భాషను నేర్చుకుంటున్నాను.\n"
                "• **'도와주셔서 진심으로 감사합니다.'**\n"
                "  → సహాయం చేసినందుకు హృదయపూర్వక ధన్యవాదాలు.\n\n"
                "다른 알고 싶은 표현이 있으신가요? 언제든 물어보세요!"
            )

        # 8. General conversational Korean response
        snippets = [s.strip() for s in re.split(r"[.?!,]", text) if len(s.strip()) > 1]
        key_snippet = f"\"{snippets[0]}\"" if snippets else "말씀하신 내용"

        return (
            f"네, {key_snippet}에 대해 말씀해 주셨군요! 아주 흥미로운 이야기예요. 🇰🇷✨\n\n"
            f"💡 **'{level}' 학습자를 위한 팁:**\n"
            f"문장을 말할 때 연결어미(예: *-는데*, *-어서/아서*, *-고*)를 사용하면 두 문장을 자연스럽게 이어 말할 수 있어요.\n"
            f"예: *\"날씨가 좋아서 산책을 가고 싶어요.\"*\n\n"
            f"이에 대해 조금 더 자세히 이야기해 주시겠어요?"
        )

    # =========================================================================
    # ENGLISH TUTOR ENGINE (English & Telugu Support)
    # =========================================================================
    def _handle_english_tutor(self, text: str, level: str, grammar: dict) -> str:
        lower = text.lower()
        corrections = grammar.get("corrections", [])

        # 1. Greetings & Introductions
        if any(w in lower for w in ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"]):
            return (
                "Hello Swapna! Welcome to your LinguaSphere AI Learning Studio! 🌟✨\n\n"
                "I am your personal AI language tutor. How are you feeling today?\n\n"
                "Here are a few great ways we can practice right now:\n"
                "• 🗣️ **Conversational Practice** — Chat about your day, travel, career, or interests.\n"
                "• 📝 **Grammar & Sentence Polishing** — Share any sentence, and I'll analyze and elevate it.\n"
                "• 🇮🇳 **Telugu ↔ English Translation** — Ask how to express any Telugu phrase naturally in English.\n"
                "• 💼 **Job Interview & Professional Prep** — Practice workplace dialogue and formal presentations.\n\n"
                "What would you like to explore today?"
            )

        # 2. Grammar Check Request or Sentences with Mistakes
        if any(phrase in lower for phrase in ["correct this", "is this correct", "check this", "fix this", "check my sentence", "did i say this right"]) or len(corrections) > 0:
            if corrections:
                primary = corrections[0]
                return (
                    f"Great initiative sharing your sentence! Let's polish it together: 🎯\n\n"
                    f"**Analysis & Correction:**\n"
                    f"• Original: *\"{text}\"*\n"
                    f"• Polished: **\"{grammar['corrected_text']}\"**\n\n"
                    f"💡 **Why this rule applies ({primary['category']}):**\n"
                    f"{primary['explanation']}\n\n"
                    f"📌 **Telugu Explanation (తెలుగు వివరణ):**\n"
                    f"ఆంగ్లంలో ఈ వాక్యాన్ని పలకడానికి **\"{grammar['corrected_text']}\"** అనేది సరైన మరియు సహజమైన రూపం.\n\n"
                    f"Can you try creating another sentence using this corrected pattern?"
                )
            else:
                return (
                    f"Spot on! 🌟 Your sentence: **\"{text}\"** is grammatically correct and flows very nicely!\n\n"
                    f"To make it sound even more sophisticated at your '{level}' level, you could say:\n"
                    f"✨ *\"{self._elevate_sentence(text)}\"*\n\n"
                    f"Would you like to try another phrase or move to a new topic?"
                )

        # 3. Vocabulary / Meaning / Definition Request
        if any(k in lower for k in ["what does", "meaning of", "define", "what is", "how to use", "synonym"]):
            return self._explain_word_or_concept(text)

        # 4. Telugu Translation & Telugu Queries
        if any(k in lower for k in ["in telugu", "translate to telugu", "telugu meaning", "telugu lo", "ardham", "artham", "తెలుగు"]):
            return self._handle_telugu_query(text)

        # 5. Job Interview / Professional English Practice
        if any(k in lower for k in ["interview", "job", "career", "introduce yourself", "resume", "hiring"]):
            return (
                "Excellent! Let's run a realistic **Mock Interview Practice** session! 💼👔\n\n"
                "**Interviewer Question:**\n"
                "\"Tell me about yourself, your core strengths, and what motivates you to learn and grow every day.\"\n\n"
                "💡 **Tutor Tip:**\n"
                "Structure your answer with the **Present-Past-Future framework**:\n"
                "1. **Present:** Where you are now & what you specialize in.\n"
                "2. **Past:** Notable experience or key accomplishments.\n"
                "3. **Future:** Why this path excites you.\n\n"
                "Whenever you're ready, type your response, and I will evaluate your fluency, vocabulary, and tone!"
            )

        # 6. Idioms & Expressions
        if any(k in lower for k in ["idiom", "phrasal verb", "expression", "proverb", "slang"]):
            return (
                "Idioms and phrasal verbs give your English natural color and fluency! 🌈\n\n"
                "Here are two essential expressions used by fluent speakers:\n\n"
                "1️⃣ **'To hit the nail on the head'** (సరిగ్గా చెప్పడం)\n"
                "   • *Meaning:* To describe exactly what is causing a situation or problem.\n"
                "   • *Example:* \"Swapna hit the nail on the head when discussing the project goals.\"\n\n"
                "2️⃣ **'A blessing in disguise'** (మంచికే జరిగిన కష్టం)\n"
                "   • *Meaning:* An apparent misfortune that eventually results in something good.\n"
                "   • *Example:* \"Missing that bus was a blessing in disguise because I met an old friend.\"\n\n"
                "Try using one of these in a sentence of your own!"
            )

        # 7. General Interactive Conversation (Contextual & Engaging)
        return self._generate_conversational_response(text, level)

    def _elevate_sentence(self, sentence: str) -> str:
        replacements = [
            ("very good", "exceptional"),
            ("very happy", "delighted"),
            ("very important", "crucial"),
            ("very big", "substantial"),
            ("i think", "in my perspective"),
            ("but", "nevertheless,"),
            ("also", "furthermore,")
        ]
        res = sentence
        for old, new in replacements:
            if old in res.lower():
                pattern = re.compile(re.escape(old), re.IGNORECASE)
                res = pattern.sub(new, res)
                break
        if res == sentence:
            res = f"Indeed, {sentence.lower()}"
        return res

    def _explain_word_or_concept(self, query: str) -> str:
        target = ""
        patterns = [
            r"what\s+does\s+([a-zA-Z\-]+)\s+mean",
            r"(?:what\s+is\s+)?the\s+meaning\s+of\s+([a-zA-Z\-]+)",
            r"define\s+([a-zA-Z\-]+)",
            r"how\s+to\s+use\s+([a-zA-Z\-]+)",
            r"what\s+is\s+([a-zA-Z\-]+)"
        ]
        for pat in patterns:
            m = re.search(pat, query, re.IGNORECASE)
            if m:
                target = m.group(1).strip().strip("?\"'.,")
                break
        if not target:
            target = query.strip().split()[-1].strip("?\"'.,")
        target_lower = target.lower()

        vocab_db = {
            "resilience": {
                "ipa": "/rɪˈzɪl.jəns/",
                "pos": "Noun",
                "meaning": "The capacity to recover quickly from difficulties; toughness.",
                "telugu": "స్థితిస్థాపకత / క్లిష్ట పరిస్థితులను తట్టుకుని నిలబడే శక్తి",
                "example": "Her remarkable resilience helped her overcome every obstacle.",
                "synonyms": "Tenacity, fortitude, perseverance"
            },
            "eloquent": {
                "ipa": "/ˈel.ə.kwənt/",
                "pos": "Adjective",
                "meaning": "Fluent or persuasive in speaking or writing.",
                "telugu": "స్పష్టమైన మరియు ఆకట్టుకునే సంభాషణ శైలి గల",
                "example": "He gave an eloquent speech that inspired the entire audience.",
                "synonyms": "Articulate, expressive, persuasive"
            },
            "perseverance": {
                "ipa": "/ˌpɜː.sɪˈvɪə.rəns/",
                "pos": "Noun",
                "meaning": "Persistence in doing something despite difficulty or delay in achieving success.",
                "telugu": "పట్టుదల / అవిశ్రాంత కృషి",
                "example": "Through perseverance and patience, she achieved her lifelong dream.",
                "synonyms": "Determination, persistence, dedication"
            },
            "ephemeral": {
                "ipa": "/ɪˈfem.ər.əl/",
                "pos": "Adjective",
                "meaning": "Lasting for a very short time; transient.",
                "telugu": "క్షణికమైనది / కొద్దికాలం మాత్రమే ఉండేది",
                "example": "Fame in the digital era can often be ephemeral.",
                "synonyms": "Fleeting, momentary, transient"
            },
            "serendipity": {
                "ipa": "/ˌser.ənˈdɪp.ə.ti/",
                "pos": "Noun",
                "meaning": "The occurrence of events by chance in a happy or beneficial way.",
                "telugu": "ఆకస్మికంగా కలిగే అదృష్టం",
                "example": "Finding this book at the cafe was pure serendipity.",
                "synonyms": "Fluke, pleasant surprise, good fortune"
            }
        }

        if target_lower in vocab_db:
            info = vocab_db[target_lower]
            return (
                f"📖 **Word Spotlight: {target.title()}**\n\n"
                f"• **Phonetics:** `{info['ipa']}`\n"
                f"• **Part of Speech:** *{info['pos']}*\n"
                f"• **Definition:** {info['meaning']}\n"
                f"• **Telugu Meaning (తెలుగు అర్థం):** **{info['telugu']}**\n"
                f"• **Example in Context:** *\"{info['example']}\"*\n"
                f"• **Synonyms:** {info['synonyms']}\n\n"
                f"✨ **Practice Challenge:** Can you craft a sentence using **{target.lower()}**? I will review it right away!"
            )

        return (
            f"📖 **Word Analysis: \"{target.title()}\"**\n\n"
            f"• **Category:** Vocabulary & Practical Usage\n"
            f"• **Practical Meaning:** It refers to expressing, describing, or experiencing '{target}'.\n"
            f"• **How to use it in conversation:**\n"
            f"  1. Subject position: *\"{target.title()} plays an important role in our daily communication.\"*\n"
            f"  2. Object position: *\"I want to improve my understanding of {target.lower()}.\"*\n\n"
            f"💡 **Telugu Hint (తెలుగు భావం):**\n"
            f"ఈ పదం సందర్భానుసారంగా ఎలా ఉపయోగించాలో వాక్య రూపంలో అభ్యసించండి.\n\n"
            f"Would you like to try using **{target}** in a short sentence so we can test its natural rhythm?"
        )

    def _handle_telugu_query(self, query: str) -> str:
        return (
            "🇮🇳 **Telugu ↔ English Translation & Nuance:**\n\n"
            "Here are helpful ways to bridge Telugu thoughts into natural, polished English:\n\n"
            "• **'నేను కొత్త విషయాలు నేర్చుకోవడానికి ఎల్లప్పుడూ సిద్ధంగా ఉంటాను'**\n"
            "  → *\"I am always eager to learn new things and expand my horizons.\"*\n\n"
            "• **'మీరు మీ పనిని సమయానికి పూర్తి చేశారా?'**\n"
            "  → *\"Did you manage to complete your assignment on schedule?\"*\n\n"
            "• **'ఈ రోజు వాతావరణం చాలా ఆహ్లాదకరంగా ఉంది'**\n"
            "  → *\"The weather is remarkably pleasant today.\"*\n\n"
            "• **'మనం నిరంతరం సాధన చేస్తేనే నైపుణ్యం పెరుగుతుంది'**\n"
            "  → *\"Consistent practice is the key to mastering any skill.\"*\n\n"
            "Tell me any Telugu sentence or phrase you're thinking of, and I'll give you the most natural English expression for it!"
        )

    def _generate_conversational_response(self, text: str, level: str) -> str:
        lower = text.lower()
        
        if any(w in lower for w in ["how are you", "how r u", "how do you do"]):
            return (
                "I'm feeling energized and ready to help you excel in your language journey! 😊✨\n\n"
                "How has your week been going so far? Did you have the chance to practice any new words or read something interesting?"
            )

        if any(w in lower for w in ["learn", "improve", "practice", "speak better", "fluency"]):
            return (
                "You have the exact right mindset for rapid fluency! 🚀\n\n"
                "Three proven habits that will quickly boost your confidence:\n"
                "1. **Think in English** for 5 minutes each morning without translating.\n"
                "2. **Shadowing**: Listen to native audio and repeat the words immediately with the same tone.\n"
                "3. **Daily micro-writing**: Write 2-3 sentences about your day right here in our chat.\n\n"
                "What is one topic you feel most excited to discuss today?"
            )

        if any(w in lower for w in ["weather", "rain", "sunny", "cold", "hot"]):
            return (
                "Talking about the weather is one of the most natural small-talk skills in English! ☀️🌧️\n\n"
                "Instead of just saying *'It is very hot'*, you can use expressive alternatives like:\n"
                "• *\"It's sweltering today!\"* (చాలా వేడిగా ఉంది)\n"
                "• *\"We are having glorious sunshine today.\"*\n\n"
                "How is the climate in your city right now?"
            )

        if any(w in lower for w in ["work", "office", "study", "college", "school", "project"]):
            return (
                "Balancing your routine while advancing your communication skills shows genuine commitment! 💼📚\n\n"
                "In professional contexts, strong transition phrases make your explanations impactful. "
                "For example: *'In order to optimize our progress, we prioritized key milestones.'*\n\n"
                "What kind of project or task are you currently focused on?"
            )

        snippets = [s.strip() for s in re.split(r"[.?!,]", text) if len(s.strip()) > 3]
        key_snippet = f"\"{snippets[0]}\"" if snippets else "your thought"

        return (
            f"That's a very engaging perspective on {key_snippet}! 💡\n\n"
            f"Your structure communicates your message clearly. To elevate your expression for a '{level}' speaker:\n"
            f"• Try beginning with a conversational bridge like: *\"From my observation...\"* or *\"I've noticed that...\"*\n\n"
            f"Could you elaborate a bit more on that? For instance, what led you to this conclusion?"
        )

    # =========================================================================
    # 2. Grammar Correction & Sentence Improvement Lab (Multilingual)
    # =========================================================================
    def analyze_grammar(self, text: str, language: str = "english") -> dict:
        corrections = []
        improvements = []
        corrected_text = text.strip()
        score = 98.0
        lang_lower = language.lower()

        # ---------------------------------------------------------------------
        # GERMAN RULES (Duden-Based NLP Engine)
        # ---------------------------------------------------------------------
        if lang_lower == "german":
            german_rules = [
                # Idiomatic expressions
                (r"\bich bin gut\b", "mir geht es gut", "In German, expressing well-being requires 'Mir geht es gut'. 'Ich bin gut' means you are skilled at something.", "Idiom & Usage"),
                (r"\bwie gehts dir\b", "Wie geht es dir?", "Add correct punctuation and capitalization.", "Punctuation"),
                # Time word order (TeKaMoLo)
                (r"\bdas wetter ist gut heute\b", "Das Wetter ist heute gut", "In German, time expressions ('heute') precede the predicate adjective ('gut').", "TeKaMoLo Word Order"),
                (r"\bin 202[0-9]\b", "im Jahr 2026 / 2026", "In German, say 'im Jahr [Jahr]' or state the year directly without 'in'.", "Preposition Usage"),
                # Auxiliary verb in Perfekt (sein vs haben)
                (r"\bich habe gegangen\b", "ich bin gegangen", "Verbs of movement/change of location take 'sein' in the Perfekt tense.", "Auxiliary Verb (Perfekt)"),
                (r"\bich habe geschwommen\b", "ich bin geschwommen", "Movement verbs like 'schwimmen' use 'sein' as auxiliary in Perfekt.", "Auxiliary Verb (Perfekt)"),
                (r"\bich habe geblieben\b", "ich bin geblieben", "'Bleiben' (to stay) requires the auxiliary 'sein' in Perfekt.", "Auxiliary Verb (Perfekt)"),
                (r"\bich habe gekommen\b", "ich bin gekommen", "Verbs of arrival take 'sein' in Perfekt.", "Auxiliary Verb (Perfekt)"),
                # Cases and prepositions (Dative vs Accusative)
                (r"\bmit der Mann\b", "mit dem Mann", "The preposition 'mit' always requires Dativ masculine ('dem').", "Dativ Case"),
                (r"\bmit die Frau\b", "mit der Frau", "The preposition 'mit' requires Dativ feminine ('der').", "Dativ Case"),
                (r"\bzu die Schule\b", "zur Schule", "'Zu' takes Dativ and contracts: zu + der = zur.", "Preposition Contraction"),
                (r"\bzu dem Arzt\b", "zum Arzt", "'Zu' takes Dativ and contracts: zu + dem = zum.", "Preposition Contraction"),
                (r"\bfür den Frau\b", "für die Frau", "The preposition 'für' takes Akkusativ feminine ('die').", "Akkusativ Case"),
                (r"\bich sehe der Mann\b", "ich sehe den Mann", "Direct objects of transitive verbs take Akkusativ masculine ('den').", "Akkusativ Object"),
                (r"\bich habe ein Hund\b", "ich habe einen Hund", "'Hund' is masculine; direct object requires 'einen Hund' (Akkusativ).", "Akkusativ Indefinite Article"),
                # Subordinate clauses (Verb-Final rule)
                (r"\bweil ich habe Zeit\b", "weil ich Zeit habe", "Subordinate conjunction 'weil' moves the conjugated verb to the end of the clause.", "Subordinate Clause (Verb-End)"),
                (r"\bdass er kommt morgen\b", "dass er morgen kommt", "Conjunction 'dass' requires the verb at the very end of the subordinate clause.", "Subordinate Clause (Verb-End)"),
                (r"\bobwohl es regnet heute\b", "obwohl es heute regnet", "Subordinate conjunction 'obwohl' sends the verb 'regnet' to the end.", "Subordinate Clause (Verb-End)"),
                # Negation
                (r"\bich habe nicht Geld\b", "ich habe kein Geld", "Nouns without a definite article are negated using 'kein', not 'nicht'.", "Negation (Kein vs Nicht)"),
                (r"\bich habe nicht Zeit\b", "ich habe keine Zeit", "Negate indefinite/uncountable nouns with 'keine'.", "Negation"),
            ]

            for pat, rep, exp, cat in german_rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 10.0
                    corrections.append({"original": pat.replace("\\b", "").strip(), "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)

            # German noun capitalization check
            common_de_nouns = ["buch", "haus", "frau", "mann", "zeit", "wasser", "freund", "arbeit", "schule", "sprache", "stadt"]
            for cn in common_de_nouns:
                if re.search(rf"\b{cn}\b", corrected_text):
                    score -= 3.0
                    corrections.append({
                        "original": cn,
                        "correction": cn.capitalize(),
                        "explanation": f"All German nouns must begin with a capital letter ('{cn.capitalize()}').",
                        "category": "Noun Capitalization"
                    })
                    corrected_text = re.sub(rf"\b{cn}\b", cn.capitalize(), corrected_text)

            improvements.append("Use German modal particles like 'doch', 'mal', or 'ja' to sound natural in conversation.")
            improvements.append("Remember the V2 rule: In standard main clauses, the conjugated verb is always position 2.")

        # ---------------------------------------------------------------------
        # KOREAN RULES (NIIED & Hangul Morphological Engine)
        # ---------------------------------------------------------------------
        elif lang_lower == "korean":
            # Missing copula / predicate
            if ("학생" in text or "선생님" in text or "사람" in text) and not any(k in text for k in ["입니다", "이야", "이에요", "예요", "이 아닙니다"]):
                score -= 12.0
                corrections.append({
                    "original": text,
                    "correction": text + "입니다",
                    "explanation": "Korean sentences require a predicate copula like '입니다' (formal) or '이에요/예요' (polite).",
                    "category": "Sentence Predicate Copula"
                })
                corrected_text = corrected_text + "입니다"

            # Pronoun & honorific mismatch (나 vs 저 with polite endings)
            if re.search(r"\b나는\b.*(입니다|습니다|어요|아요|해요)", text):
                score -= 10.0
                corrections.append({
                    "original": "나는",
                    "correction": "저는",
                    "explanation": "When using polite or formal sentence endings (-요, -습니다), use the humble pronoun '저' (저는) instead of '나' (나는).",
                    "category": "Honorific Concordance"
                })
                corrected_text = re.sub(r"\b나는\b", "저는", corrected_text)

            # Missing object particle
            if "사과 좋아해요" in text or "사과를" not in text and "사과 좋아" in text:
                score -= 8.0
                corrections.append({
                    "original": "사과 좋아해요",
                    "correction": "사과를 좋아해요",
                    "explanation": "Add the object particle '를' after vowel-ending nouns ('사과를') for clear grammatical flow.",
                    "category": "Object Particle (을/를)"
                })
                corrected_text = corrected_text.replace("사과 좋아해요", "사과를 좋아해요")

            # Missing destination particle
            if "학교 가요" in text or "집 가요" in text:
                score -= 8.0
                corrections.append({
                    "original": "학교 가요 / 집 가요",
                    "correction": "학교에 가요 / 집에 가요",
                    "explanation": "Add the destination particle '에' (at/to) before movement verbs like '가다' (to go).",
                    "category": "Direction Particle (에)"
                })
                corrected_text = corrected_text.replace("학교 가요", "학교에 가요").replace("집 가요", "집에 가요")

            improvements.append("Remember the distinction: Topic particle '은/는' (context/contrast) vs Subject particle '이/가' (specific agent).")
            improvements.append("In polite conversation, conclude verbs with informal polite '-아요/어요' or formal '-습니다'.")

        # ---------------------------------------------------------------------
        # ENGLISH RULES (Comprehensive Pedagogical Syntax Engine)
        # ---------------------------------------------------------------------
        else:
            english_rules = [
                # Subject-Verb Agreement
                (r"\bi is\b", "I am", "Subject-verb agreement: 'I' takes 'am'.", "Subject-Verb Agreement"),
                (r"\byou is\b", "you are", "Subject-verb agreement: 'you' takes 'are'.", "Subject-Verb Agreement"),
                (r"\bwe is\b", "we are", "Plural subject 'we' takes 'are'.", "Subject-Verb Agreement"),
                (r"\bthey is\b", "they are", "Plural subject 'they' takes 'are'.", "Subject-Verb Agreement"),
                (r"\bhe have\b", "he has", "Third-person singular 'he' takes 'has'.", "Subject-Verb Agreement"),
                (r"\bshe have\b", "she has", "Third-person singular 'she' takes 'has'.", "Subject-Verb Agreement"),
                (r"\bit have\b", "it has", "Third-person singular 'it' takes 'has'.", "Subject-Verb Agreement"),
                (r"\bshe don'?t\b", "she doesn't", "Third-person singular 'she' takes 'doesn't' (does not).", "Subject-Verb Agreement"),
                (r"\bhe don'?t\b", "he doesn't", "Third-person singular 'he' takes 'doesn't' (does not).", "Subject-Verb Agreement"),
                (r"\bit don'?t\b", "it doesn't", "Third-person singular 'it' takes 'doesn't' (does not).", "Subject-Verb Agreement"),
                (r"\bone of my friend\b", "one of my friends", "'One of' is followed by a plural countable noun ('friends').", "Noun Number"),
                (r"\beach of them have\b", "each of them has", "'Each' is grammatically singular and takes 'has'.", "Subject-Verb Agreement"),

                # Double Past Tense / Auxiliary Concordance
                (r"\bdid went\b", "did go", "The auxiliary 'did' takes the base form of the verb ('go').", "Double Past Tense"),
                (r"\bdid ate\b", "did eat", "The auxiliary 'did' takes the base form of the verb ('eat').", "Double Past Tense"),
                (r"\bdid saw\b", "did see", "The auxiliary 'did' takes the base form of the verb ('see').", "Double Past Tense"),
                (r"\bdid came\b", "did come", "The auxiliary 'did' takes the base form of the verb ('come').", "Double Past Tense"),
                (r"\bdid told\b", "did tell", "The auxiliary 'did' takes the base form of the verb ('tell').", "Double Past Tense"),
                (r"\bdoes has\b", "does have", "Auxiliary 'does' takes base verb 'have'.", "Auxiliary Concordance"),

                # Articles
                (r"\ba apple\b", "an apple", "Use indefinite article 'an' before vowel sounds.", "Article Usage"),
                (r"\ba orange\b", "an orange", "Use 'an' before vowel sounds.", "Article Usage"),
                (r"\ba hour\b", "an hour", "The 'h' in hour is silent; use 'an'.", "Article Usage"),
                (r"\ban university\b", "a university", "'University' starts with a 'yu' consonant glide; use 'a'.", "Article Usage"),
                (r"\ban european\b", "a European", "'European' starts with a 'yu' sound; use 'a'.", "Article Usage"),

                # Preposition Collocations
                (r"\bdepends of\b", "depends on", "Preposition collocation: 'depend' takes 'on'.", "Preposition Collocation"),
                (r"\blisten music\b", "listen to music", "The verb 'listen' requires 'to' before an object.", "Preposition"),
                (r"\bcongratulate for\b", "congratulate on", "In English, we congratulate someone 'on' an achievement.", "Preposition Collocation"),
                (r"\bmarried with\b", "married to", "In English, say 'married to' someone.", "Preposition Collocation"),
                (r"\binterested with\b", "interested in", "Collocation: 'interested' takes 'in'.", "Preposition Collocation"),
                (r"\bgood in english\b", "good at English", "Say 'good at' an activity or language.", "Preposition Collocation"),
                (r"\bsimilar with\b", "similar to", "Collocation: 'similar' takes 'to'.", "Preposition Collocation"),
                (r"\bafraid from\b", "afraid of", "Collocation: 'afraid' takes 'of'.", "Preposition Collocation"),
                (r"\barrive to\b", "arrive at / in", "We arrive 'at' a place or 'in' a city/country.", "Preposition Collocation"),
                (r"\blook forward to meet\b", "look forward to meeting", "'Look forward to' is followed by a gerund (-ing form).", "Gerund Usage"),
                (r"\blook forward to see\b", "look forward to seeing", "'Look forward to' requires a gerund (-ing form).", "Gerund Usage"),

                # Redundant Prepositions & Words
                (r"\bdiscuss about\b", "discuss", "The verb 'discuss' is transitive and does not take 'about'.", "Redundant Preposition"),
                (r"\bdescribe about\b", "describe", "'Describe' is transitive and directly takes the object.", "Redundant Preposition"),
                (r"\breturn back\b", "return", "'Return' already means to go or come back.", "Redundancy"),
                (r"\brevert back\b", "reply / revert", "Use 'reply' or 'revert' without 'back'.", "Redundancy"),
                (r"\brepeat again\b", "repeat", "'Repeat' already means to do or say again.", "Redundancy"),

                # Common Transfer & Confused Words
                (r"\bi am having doubt\b", "I have a question", "In standard English, say 'I have a question'.", "Idiomatic Usage"),
                (r"\bi am having two brothers\b", "I have two brothers", "Stative verbs like 'have' (possession/family) take simple present.", "Stative Verb"),
                (r"\bmore better\b", "better", "Avoid double comparatives: 'better' is already comparative.", "Double Comparative"),
                (r"\bmore easier\b", "easier", "Avoid double comparatives: use 'easier'.", "Double Comparative"),
                (r"\byour right\b", "you're right", "'Your' is possessive; use 'you're' (you are).", "Confused Words"),
                (r"\btheir is\b", "there is", "Use 'there is' for existence, not possessive 'their'.", "Confused Words"),
            ]

            for pat, rep, exp, cat in english_rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 10.0
                    corrections.append({"original": pat.replace("\\b", "").strip(), "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)

            if "very good" in text.lower():
                improvements.append("Elevate 'very good' with 'exceptional', 'outstanding', or 'superb'.")
            if "i think" in text.lower():
                improvements.append("Try using 'In my perspective', 'From my viewpoint', or 'I believe' to sound more authoritative.")

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
                },
                {
                    "id": "te-de-3",
                    "direction": "to_telugu",
                    "direction_title": "Read German (Deutsch) → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "Übung macht den Meister.",
                    "telugu_sentence": "నిరంతర సాధన మనిషిని నిపుణుడిగా మారుస్తుంది (సాధనమున సమకూరు ధరలోన పనులు).",
                    "options": [
                        "సమయం ఎవరి కోసమూ ఆగదు.",
                        "నిరంతర సాధన మనిషిని నిపుణుడిగా మారుస్తుంది (సాధనమున సమకూరు ధరలోన పనులు).",
                        "పుస్తకాలు మన మంచి మిత్రులు.",
                        "ఈ రోజు చాలా చలిగా ఉంది."
                    ],
                    "correct_index": 1,
                    "explanation": "'Übung macht den Meister' అనేది ప్రసిద్ధ జర్మన్ సామెత ('Practice makes perfect')."
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
                },
                {
                    "id": "te-ko-3",
                    "direction": "to_telugu",
                    "direction_title": "Read Korean (한국어) → Translate to Telugu (తెలుగులోకి అనువదించండి)",
                    "source_sentence": "한국어를 배우는 것은 아주 재미있어요.",
                    "telugu_sentence": "కొరియన్ భాష నేర్చుకోవడం చాలా ఆనందంగా ఉంది.",
                    "options": [
                        "కొరియన్ ఆహారం చాలా కారంగా ఉంటుంది.",
                        "నేను కొరియాకు వెళ్లాలనుకుంటున్నాను.",
                        "కొరియన్ భాష నేర్చుకోవడం చాలా ఆనందంగా ఉంది.",
                        "ఈ సినిమా చాలా బాగుంది."
                    ],
                    "correct_index": 2,
                    "explanation": "'한국어를 배우는 것은' = కొరియన్ భాష నేర్చుకోవడం, '아주 재미있어요' = చాలా ఆనందంగా ఉంది."
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
                },
                {
                    "word": "Die Gemütlichkeit",
                    "phonetic": "/ɡəˈmyːtlɪçkaɪ̯t/",
                    "syllables": "Ge-müt-lich-keit",
                    "part_of_speech": "noun (feminine)",
                    "difficulty": "beginner",
                    "definition": "A state of warmth, friendliness, and coziness.",
                    "example": "Die Gemütlichkeit im Kaffeehaus war wunderbar.",
                    "collocations": ["warme Gemütlichkeit", "Gemütlichkeit ausstrahlen"]
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
                },
                {
                    "word": "정 (Jeong)",
                    "phonetic": "/t͡ɕʌŋ/",
                    "syllables": "Jeong",
                    "part_of_speech": "noun",
                    "difficulty": "beginner",
                    "definition": "Deep, warm emotional bond and affection developed over time.",
                    "example": "오래 알고 지낸 이웃과 깊은 정이 들었어요.",
                    "collocations": ["정이 많다", "정이 들다"]
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
            feedback = "Gute Aussprache und klare Satzstruktur im Deutschen."
            next_prompt = "Könnten Sie mir mehr über Ihre bisherigen Erfahrungen und Stärken erzählen?"
        elif language == "korean":
            speaker = "면접관 (Interviewer)"
            feedback = "자연스러운 존댓말 사용과 명확한 의사전달입니다."
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

    # =========================================================================
    # 8. Daily Practice Challenges
    # =========================================================================
    def get_daily_practice(self, language: str = "english", level: str = "intermediate") -> dict:
        challenges = {
            "english": {
                "day_title": "Daily English Workout & Reflex Builder",
                "idiom": {
                    "phrase": "Hit the nail on the head",
                    "meaning": "To describe exactly what is causing a situation or problem.",
                    "example": "Swapna hit the nail on the head when presenting the project roadmap.",
                    "telugu_meaning": "సరిగ్గా చెప్పడం / వాస్తవాన్ని కచ్చితంగా వ్యక్తపరచడం"
                },
                "grammar_puzzle": {
                    "question": "Which sentence is grammatically correct?",
                    "options": [
                        "She don't know the answer to this question.",
                        "She doesn't know the answer to this question.",
                        "She didn't knew the answer to this question.",
                        "She not knows the answer to this question."
                    ],
                    "correct_index": 1,
                    "explanation": "Third-person singular subject 'she' requires 'does not' / 'doesn't' followed by base verb 'know'."
                },
                "dialogue_scenario": {
                    "context": "Professional Workplace Collaboration",
                    "prompt": "How would you politely ask a colleague for their feedback on your new proposal?",
                    "suggested_opening": "Could you please take a look at my proposal and share your candid feedback whenever you have a moment?"
                },
                "sentence_builder": {
                    "words": ["Consistency", "and", "dedication", "lead", "to", "remarkable", "growth"],
                    "correct_order": "Consistency and dedication lead to remarkable growth."
                }
            },
            "german": {
                "day_title": "Tägliche Deutsch-Übung",
                "idiom": {
                    "phrase": "Daumen drücken",
                    "meaning": "To cross one's fingers; wish someone good luck.",
                    "example": "Ich drücke dir für deine morgige Präsentation ganz fest die Daumen!",
                    "telugu_meaning": "మంచి జరగాలని కోరుకోవడం (ఆల్ ది బెస్ట్ చెప్పడం)"
                },
                "grammar_puzzle": {
                    "question": "Welcher Satz ist grammatikalisch korrekt?",
                    "options": [
                        "Ich habe gestern ein Buch gelesen.",
                        "Ich habe gestern gelesen ein Buch.",
                        "Ich gestern ein Buch habe gelesen.",
                        "Ich gelesen habe gestern ein Buch."
                    ],
                    "correct_index": 0,
                    "explanation": "Im deutschen Perfekt steht das Hilfsverb an Position 2 und das Partizip II ('gelesen') am Satzende."
                },
                "dialogue_scenario": {
                    "context": "Im Café bestellen",
                    "prompt": "Wie bestellst du höflich einen Cappuccino mit Hafermilch?",
                    "suggested_opening": "Ich hätte gerne einen Cappuccino mit Hafermilch, bitte."
                },
                "sentence_builder": {
                    "words": ["Übung", "macht", "den", "Meister", "im", "Leben"],
                    "correct_order": "Übung macht den Meister im Leben."
                }
            },
            "korean": {
                "day_title": "오늘의 한국어 데일리 챌린지",
                "idiom": {
                    "phrase": "발이 넓다 (Bal-i neolp-da)",
                    "meaning": "To have a wide circle of acquaintances; well-connected.",
                    "example": "그분은 발이 넓어서 아는 사람이 아주 많아요.",
                    "telugu_meaning": "చాలా మంది పరిచయస్థులు మరియు మంచి సంబంధాలు కలిగి ఉండడం"
                },
                "grammar_puzzle": {
                    "question": "다음 중 올바른 존댓말 문장은 무엇인가요?",
                    "options": [
                        "저는 학생이야.",
                        "저는 학생입니다.",
                        "나는 학생이에요.",
                        "나는 학생입니다."
                    ],
                    "correct_index": 1,
                    "explanation": "겸칭 '저'와 격식체 종결어미 '입니다'가 조화롭게 결합된 '저는 학생입니다'가 가장 올바릅니다."
                },
                "dialogue_scenario": {
                    "context": "카페에서 주문하기",
                    "prompt": "아이스 아메리카노 한 잔을 정중하게 주문해 보세요.",
                    "suggested_opening": "아이스 아메리카노 한 잔 부탁드립니다."
                },
                "sentence_builder": {
                    "words": ["꾸준한", "노력은", "반드시", "좋은", "결실을", "맺습니다"],
                    "correct_order": "꾸준한 노력은 반드시 좋은 결실을 맺습니다."
                }
            }
        }
        return challenges.get(language.lower(), challenges["english"])

ai_tutor = MultilingualAIService()
