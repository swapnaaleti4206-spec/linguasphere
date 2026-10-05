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
        lang_names = {"english": "English", "german": "German (Deutsch)", "korean": "Korean (한국어)"}
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
        lower = raw_text.lower()
        grammar = self.analyze_grammar(raw_text, language=language)
        corrections = grammar.get("corrections", [])
        improvements = grammar.get("improvements", [])

        # --- German Handler ---
        if language == "german":
            if any(w in lower for w in ["hallo", "guten tag", "hi", "servus", "guten morgen"]):
                reply = (
                    "Hallo! Herzlich willkommen im LinguaSphere Deutsch-Studio! 🇩🇪✨\n\n"
                    "Wie geht es dir heute? (How are you doing today?)\n"
                    "Hier sind 3 Dinge, die wir heute üben können:\n"
                    "1️⃣ Alltagsgespräche (Daily conversation: Wetter, Hobbys, Arbeit)\n"
                    "2️⃣ Grammatik & Artikel (der, die, das oder Fälle wie Akkusativ/Dativ)\n"
                    "3️⃣ Wortschatz & Telugu/Englisch Übersetzung (Vocabulary & Translation)\n\n"
                    "Worüber möchtest du sprechen?"
                )
            elif any(w in lower for w in ["danke", "vielen dank"]):
                reply = (
                    "Gerne geschehen! (You're very welcome! / మీకు స్వాగతం!)\n"
                    "Du machst tolle Fortschritte. Möchtest du einen neuen Satz ausprobieren?"
                )
            elif "artikel" in lower or "der die das" in lower:
                reply = (
                    "🇩🇪 **Deutsche Artikel (Der, Die, Das) Schnelltipps:**\n\n"
                    "• **der** (Maskulin): Endungen auf *-ling, -or, -ist, -ismus* (der Optimismus, der Motor).\n"
                    "• **die** (Feminin): Endungen auf *-ung, -heit, -keit, -schaft, -tion, -tät* (die Freiheit, die Station).\n"
                    "• **das** (Neutral): Endungen auf *-chen, -lein, -um, -ment* (das Mädchen, das Dokument).\n\n"
                    "Möchtest du ein paar Übungen dazu machen?"
                )
            else:
                reply = (
                    f"Das ist ein interessanter Gedanke! Auf Deutsch sagt man das sehr treffend.\n\n"
                    f"💡 **Tipp für '{level}' Niveau:** Achte darauf, das Verb immer an die 2. Position im Hauptsatz zu setzen.\n"
                    f"Könntest du mir mehr darüber erzählen? (Could you tell me more about that?)"
                )
            return {
                "response": reply,
                "corrections": corrections,
                "suggestions": improvements,
                "language": language,
                "level": level
            }

        # --- Korean Handler ---
        if language == "korean":
            if any(w in lower for w in ["안녕", "안녕하세요", "hi", "hello", "annyeong"]):
                reply = (
                    "안녕하세요! 링구아스피어 한국어 학습 스튜디오에 오신 것을 환영합니다! 🇰🇷✨\n\n"
                    "오늘 하루는 어떠셨나요? (How was your day?)\n"
                    "오늘 함께 연습해 볼 주제를 선택해 보세요:\n"
                    "1️⃣ 일상 회화 연습 (Daily Korean Conversation)\n"
                    "2️⃣ 필수 문법 및 존댓말 연습 (Polite endings: -아요/어요, -습니다)\n"
                    "3️⃣ 단어 및 텔루구어/영어 번역 (Vocabulary & Translation)\n\n"
                    "어떤 것부터 시작해 볼까요?"
                )
            elif any(w in lower for w in ["감사", "고마워", "gamsahamnida"]):
                reply = (
                    "천만에요! (You're welcome! / పర్వాలేదండి!)\n"
                    "한국어 발음과 표현이 점점 자연스러워지고 있어요. 다음 문장도 말해볼까요?"
                )
            elif any(w in lower for w in ["은/는", "이/가", "조사", "particle"]):
                reply = (
                    "🇰🇷 **한국어 핵심 조사 가이드 (Topic vs Subject):**\n\n"
                    "• **은 / 는** (주제 조사 - Topic): 문장의 큰 주제나 대조를 나타낼 때 사용합니다.\n"
                    "  예: 저는 학생입니다 (Speaking of me, I am a student).\n"
                    "• **이 / 가** (주격 조사 - Subject): 특정 행동의 주체를 강조할 때 사용합니다.\n"
                    "  예: 비가 와요 (Rain is falling).\n\n"
                    "이해가 잘 되셨나요? 예문 하나를 직접 만들어 보시겠어요?"
                )
            else:
                reply = (
                    f"정말 훌륭한 문장이에요! '{level}' 수준에 잘 맞는 표현입니다.\n\n"
                    f"💡 **한국어 꿀팁:** 존댓말을 쓸 때는 문장 끝을 '-해요' 또는 '-습니다'로 마무리하는 것이 정중합니다.\n"
                    f"이에 대해 더 이야기해 주시겠어요? (Could you share more about that?)"
                )
            return {
                "response": reply,
                "corrections": corrections,
                "suggestions": improvements,
                "language": language,
                "level": level
            }

        # --- English (Primary & Multilingual Tutor Engine) ---
        # 1. Greetings & Introductions
        if any(w in lower for w in ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"]):
            reply = (
                "Hello Swapna! Welcome to your LinguaSphere AI Learning Studio! 🌟✨\n\n"
                "I am your personal AI language tutor. How are you feeling today?\n\n"
                "Here are a few great ways we can practice right now:\n"
                "• 🗣️ **Conversational Practice** — Chat about your day, travel, books, or interests.\n"
                "• 📝 **Grammar & Sentence Polishing** — Share any sentence, and I'll analyze and elevate it.\n"
                "• 🇮🇳 **Telugu ↔ English Translation** — Ask how to express any Telugu phrase naturally in English.\n"
                "• 💼 **Job Interview & Professional Prep** — Practice workplace dialogue and formal presentations.\n\n"
                "What would you like to explore today?"
            )

        # 2. Explicit Grammar Check Request or Sentences with Grammar Mistakes
        elif any(phrase in lower for phrase in ["correct this", "is this correct", "check this", "fix this", "check my sentence", "did i say this right"]) or len(corrections) > 0:
            if corrections:
                primary = corrections[0]
                reply = (
                    f"Great initiative sharing your sentence! Let's polish it together: 🎯\n\n"
                    f"**Analysis & Correction:**\n"
                    f"• Original: *\"{raw_text}\"*\n"
                    f"• Polished: **\"{grammar['corrected_text']}\"**\n\n"
                    f"💡 **Why this rule applies ({primary['category']}):**\n"
                    f"{primary['explanation']}\n\n"
                    f"📌 **Telugu Explanation (తెలుగు వివరణ):**\n"
                    f"ఆంగ్లంలో ఈ వాక్యాన్ని పలకడానికి **\"{grammar['corrected_text']}\"** అనేది సరైన మరియు సహజమైన రూపం.\n\n"
                    f"Can you try creating another sentence using this corrected pattern?"
                )
            else:
                reply = (
                    f"Spot on! 🌟 Your sentence: **\"{raw_text}\"** is grammatically correct and flows very nicely!\n\n"
                    f"To make it sound even more sophisticated at your '{level}' level, you could say:\n"
                    f"✨ *\"{self._elevate_sentence(raw_text)}\"*\n\n"
                    f"Would you like to try another phrase or move to a new topic?"
                )

        # 3. Vocabulary / Meaning / Definition Request
        elif any(k in lower for k in ["what does", "meaning of", "define", "what is", "how to use", "synonym"]):
            vocab_info = self._explain_word_or_concept(raw_text)
            reply = vocab_info

        # 4. Telugu Translation & Telugu Queries
        elif any(k in lower for k in ["in telugu", "translate to telugu", "telugu meaning", "telugu lo", "ardham", "artham"]):
            reply = self._handle_telugu_query(raw_text)

        # 5. Job Interview / Professional English Practice
        elif any(k in lower for k in ["interview", "job", "career", "introduce yourself", "resume"]):
            reply = (
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
        elif any(k in lower for k in ["idiom", "phrasal verb", "expression", "proverb", "slang"]):
            reply = (
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
        else:
            thoughtful_response = self._generate_conversational_response(raw_text, level)
            reply = thoughtful_response

        return {
            "response": reply,
            "corrections": corrections,
            "suggestions": improvements,
            "language": language,
            "level": level
        }

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
        # Match target word precisely
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

        # Curated vocabulary database with Telugu translations and IPA
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
            "Tell me any Telugu sentence or phrase you're thinking of, and I'll give you the most natural English expression for it!"
        )

    def _generate_conversational_response(self, text: str, level: str) -> str:
        lower = text.lower()
        
        # Categorized Conversational Intent
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

        # Dynamic reflective fallback that echoes the user's specific context
        snippets = [s.strip() for s in re.split(r"[.?!,]", text) if len(s.strip()) > 3]
        key_snippet = f"\"{snippets[0]}\"" if snippets else "your thought"

        return (
            f"That's a very engaging perspective on {key_snippet}! 💡\n\n"
            f"Your structure communicates your message clearly. To elevate your expression for a '{level}' speaker:\n"
            f"• Try beginning with a conversational bridge like: *\"From my observation...\"* or *\"I've noticed that...\"*\n\n"
            f"Could you elaborate a bit more on that? For instance, what led you to this conclusion?"
        )

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
                (r"\bshe don'?t\b", "she doesn't", "Third-person singular: 'she' takes 'does not' / 'doesn't'.", "Subject-Verb Agreement"),
                (r"\bhe don'?t\b", "he doesn't", "Third-person singular: 'he' takes 'does not' / 'doesn't'.", "Subject-Verb Agreement"),
                (r"\bit don'?t\b", "it doesn't", "Third-person singular: 'it' takes 'does not' / 'doesn't'.", "Subject-Verb Agreement"),
                (r"\bdid went\b", "did go", "Past simple auxiliary 'did' takes base verb 'go'.", "Double Past Tense"),
                (r"\bdid ate\b", "did eat", "Past simple auxiliary 'did' takes base verb 'eat'.", "Double Past Tense"),
                (r"\bdid saw\b", "did see", "Past simple auxiliary 'did' takes base verb 'see'.", "Double Past Tense"),
                (r"\ba apple\b", "an apple", "Use indefinite article 'an' before vowel sounds.", "Article Usage"),
                (r"\ba hour\b", "an hour", "The 'h' in hour is silent; use 'an'.", "Article Usage"),
                (r"\bdepends of\b", "depends on", "Preposition collocation: 'depend' takes 'on'.", "Collocation"),
                (r"\blisten music\b", "listen to music", "The verb 'listen' requires the preposition 'to' before an object.", "Preposition"),
                (r"\bcongratulate for\b", "congratulate on", "Preposition collocation: we congratulate someone 'on' their achievement.", "Collocation"),
                (r"\bmarried with\b", "married to", "In English, say 'married to' someone.", "Preposition Collocation"),
                (r"\blook forward to meet\b", "look forward to meeting", "'Look forward to' is followed by a gerund (-ing form).", "Gerund Usage"),
                (r"\bdiscuss about\b", "discuss", "The verb 'discuss' is transitive and does not take 'about'.", "Redundant Preposition")
            ]
            for pat, rep, exp, cat in rules:
                if re.search(pat, corrected_text, re.IGNORECASE):
                    score -= 10.0
                    corrections.append({"original": pat.replace("\\b", ""), "correction": rep, "explanation": exp, "category": cat})
                    corrected_text = re.sub(pat, rep, corrected_text, count=1, flags=re.IGNORECASE)

            if "very good" in text.lower():
                improvements.append("Elevate 'very good' with 'exceptional', 'outstanding', or 'superb'.")
            if "i think" in text.lower():
                improvements.append("Try using 'In my perspective', 'From my viewpoint', or 'I believe'.")

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

    # =========================================================================
    # 8. Daily Practice Challenges
    # =========================================================================
    def get_daily_practice(self, language: str = "english", level: str = "intermediate") -> dict:
        """
        Returns structured daily workout including Idiom of the Day,
        Grammar Puzzle, Dialogue Scenario, and Sentence Construction Challenge.
        """
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
