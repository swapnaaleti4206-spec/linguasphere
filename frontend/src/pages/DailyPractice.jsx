import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Volume2,
  RefreshCw,
  Edit3,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const FALLBACK_CHALLENGES = {
  english: {
    day_title: "Daily English Workout & Reflex Builder",
    idiom: {
      phrase: "Hit the nail on the head",
      meaning: "To describe exactly what is causing a situation or problem.",
      example: "Swapna hit the nail on the head when presenting the project roadmap.",
      telugu_meaning: "సరిగ్గా చెప్పడం / వాస్తవాన్ని కచ్చితంగా వ్యక్తపరచడం"
    },
    grammar_puzzle: {
      question: "Which sentence is grammatically correct?",
      options: [
        "She don't know the answer to this question.",
        "She doesn't know the answer to this question.",
        "She didn't knew the answer to this question.",
        "She not knows the answer to this question."
      ],
      correct_index: 1,
      explanation: "Third-person singular subject 'she' requires 'does not' / 'doesn't' followed by the base verb 'know'."
    },
    dialogue_scenario: {
      context: "Professional Workplace Collaboration",
      prompt: "How would you politely ask a colleague for their feedback on your new proposal?",
      suggested_opening: "Could you please take a look at my proposal and share your candid feedback whenever you have a moment?"
    },
    sentence_builder: {
      words: ["Consistency", "and", "dedication", "lead", "to", "remarkable", "growth"],
      correct_order: "Consistency and dedication lead to remarkable growth."
    }
  },
  german: {
    day_title: "Tägliche Deutsch-Übung",
    idiom: {
      phrase: "Daumen drücken",
      meaning: "To cross one's fingers; wish someone good luck.",
      example: "Ich drücke dir für deine morgige Präsentation ganz fest die Daumen!",
      telugu_meaning: "మంచి జరగాలని కోరుకోవడం (ఆల్ ది బెస్ట్ చెప్పడం)"
    },
    grammar_puzzle: {
      question: "Welcher Satz ist grammatikalisch korrekt?",
      options: [
        "Ich habe gestern ein Buch gelesen.",
        "Ich habe gestern gelesen ein Buch.",
        "Ich gestern ein Buch habe gelesen.",
        "Ich gelesen habe gestern ein Buch."
      ],
      correct_index: 0,
      explanation: "Im deutschen Perfekt steht das Hilfsverb an Position 2 und das Partizip II ('gelesen') am Satzende."
    },
    dialogue_scenario: {
      context: "Im Café bestellen",
      prompt: "Wie bestellst du höflich einen Cappuccino mit Hafermilch?",
      suggested_opening: "Ich hätte gerne einen Cappuccino mit Hafermilch, bitte."
    },
    sentence_builder: {
      words: ["Übung", "macht", "den", "Meister", "im", "Leben"],
      correct_order: "Übung macht den Meister im Leben."
    }
  },
  korean: {
    day_title: "오늘의 한국어 데일리 챌린지",
    idiom: {
      phrase: "발이 넓다 (Bal-i neolp-da)",
      meaning: "To have a wide circle of acquaintances; well-connected.",
      example: "그분은 발이 넓어서 아는 사람이 아주 많아요.",
      telugu_meaning: "చాలా మంది పరిచయస్థులు మరియు మంచి సంబంధాలు కలిగి ఉండడం"
    },
    grammar_puzzle: {
      question: "다음 중 올바른 존댓말 문장은 무엇인가요?",
      options: [
        "저는 학생이야.",
        "저는 학생입니다.",
        "나는 학생이에요.",
        "나는 학생입니다."
      ],
      correct_index: 1,
      explanation: "겸칭 '저'와 격식체 종결어미 '입니다'가 조화롭게 결합된 '저는 학생입니다'가 가장 올바릅니다."
    },
    dialogue_scenario: {
      context: "카페에서 주문하기",
      prompt: "아이스 아메리카노 한 잔을 정중하게 주문해 보세요.",
      suggested_opening: "아이스 아메리카노 한 잔 부탁드립니다."
    },
    sentence_builder: {
      words: ["꾸준한", "노력은", "반드시", "좋은", "결실을", "맺습니다"],
      correct_order: "꾸준한 노력은 반드시 좋은 결실을 맺습니다."
    }
  }
};

export default function DailyPractice({ level, language = 'english' }) {
  const defaultData = FALLBACK_CHALLENGES[language] || FALLBACK_CHALLENGES.english;
  const [dailyData, setDailyData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Sentence Construction state with real typing input & cursor support
  const [typedSentence, setTypedSentence] = useState('');
  const [availableWords, setAvailableWords] = useState([]);
  const [sentenceChecked, setSentenceChecked] = useState(false);
  const [sentenceIsCorrect, setSentenceIsCorrect] = useState(false);

  useEffect(() => {
    loadDaily();
  }, [level, language]);

  async function loadDaily() {
    try {
      setLoading(true);
      const data = await api.getDailyPractice(language, level);
      if (data && data.idiom && data.idiom.phrase) {
        setDailyData(data);
        initSentenceBuilder(data);
      } else {
        const fallback = FALLBACK_CHALLENGES[language] || FALLBACK_CHALLENGES.english;
        setDailyData(fallback);
        initSentenceBuilder(fallback);
      }
    } catch (err) {
      console.warn('Using local daily practice data:', err);
      const fallback = FALLBACK_CHALLENGES[language] || FALLBACK_CHALLENGES.english;
      setDailyData(fallback);
      initSentenceBuilder(fallback);
    } finally {
      setLoading(false);
      setSelectedOption(null);
      setSubmittedQuiz(false);
      setSentenceChecked(false);
    }
  }

  function initSentenceBuilder(data) {
    if (data?.sentence_builder?.words) {
      const shuffled = [...data.sentence_builder.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setTypedSentence('');
    }
  }

  function handleWordClick(word) {
    setTypedSentence((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${word}` : word;
    });
    setSentenceChecked(false);
  }

  function handleClearSentence() {
    setTypedSentence('');
    setSentenceChecked(false);
  }

  function handleCheckSentence() {
    if (!typedSentence.trim()) return;

    const normalize = (s) =>
      s
        .toLowerCase()
        .replace(/[.,?!;:"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const constructed = normalize(typedSentence);
    const target = normalize(dailyData?.sentence_builder?.correct_order || '');

    const isOk = constructed === target;
    setSentenceIsCorrect(isOk);
    setSentenceChecked(true);
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {dailyData?.day_title || `Daily ${language.toUpperCase()} Practice Challenge`}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            5 minutes of daily practice locks in natural idioms, sentence patterns, and grammar reflexes.
          </p>
        </div>
        <button
          onClick={loadDaily}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          title="Refresh challenge"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Idiom of the Day */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-warning">Idiom of the Day ({language})</span>
            <button
              onClick={() => speakText(dailyData?.idiom?.phrase || '', { language })}
              className="btn btn-secondary btn-sm"
              title={`Listen in ${language}`}
            >
              <Volume2 size={14} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            "{dailyData?.idiom?.phrase}"
          </h3>

          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Meaning:</strong> {dailyData?.idiom?.meaning}
          </div>

          {dailyData?.idiom?.telugu_meaning && (
            <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>
              <strong>తెలుగు భావం:</strong> {dailyData?.idiom?.telugu_meaning}
            </div>
          )}

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
            <strong>In Context:</strong> "{dailyData?.idiom?.example}"
          </div>
        </div>

        {/* Grammar Puzzle */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-primary">Grammar Puzzle</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Level: {level}</span>
          </div>

          <p style={{ fontSize: '0.96rem', fontWeight: 600 }}>{dailyData?.grammar_puzzle?.question}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dailyData?.grammar_puzzle?.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = dailyData.grammar_puzzle.correct_index === idx;

              let bg = 'var(--bg-secondary)';
              let borderColor = 'var(--border-light)';
              if (submittedQuiz) {
                if (isCorrect) {
                  bg = 'var(--success-light)';
                  borderColor = 'var(--success)';
                } else if (isSelected) {
                  bg = 'var(--danger-light)';
                  borderColor = 'var(--danger)';
                }
              } else if (isSelected) {
                bg = 'var(--primary-light)';
                borderColor = 'var(--primary)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !submittedQuiz && setSelectedOption(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bg,
                    textAlign: 'left',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: submittedQuiz ? 'default' : 'pointer'
                  }}
                >
                  <span>{opt}</span>
                  {submittedQuiz && isCorrect && <CheckCircle size={16} color="var(--success)" />}
                  {submittedQuiz && isSelected && !isCorrect && <XCircle size={16} color="var(--danger)" />}
                </button>
              );
            })}
          </div>

          {!submittedQuiz ? (
            <button
              onClick={() => setSubmittedQuiz(true)}
              disabled={selectedOption === null}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-end', marginTop: '6px' }}
            >
              Check Answer
            </button>
          ) : (
            <div style={{ fontSize: '0.82rem', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <strong>Explanation:</strong> {dailyData?.grammar_puzzle?.explanation}
            </div>
          )}
        </div>
      </div>

      {/* Dialogue Scenario */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-success">Daily Dialogue Scenario</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Context: {dailyData?.dialogue_scenario?.context}</span>
        </div>

        <p style={{ fontSize: '0.94rem' }}>{dailyData?.dialogue_scenario?.prompt}</p>

        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary)', fontSize: '0.9rem' }}>
          <strong>Suggested Natural Phrasing:</strong> "{dailyData?.dialogue_scenario?.suggested_opening}"
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => speakText(dailyData?.dialogue_scenario?.suggested_opening || '', { language })}
              className="btn btn-secondary btn-sm"
            >
              <Volume2 size={14} /> Listen to Example
            </button>
          </div>
        </div>
      </div>

      {/* Sentence Construction Challenge (With Active Typing, Cursor & Clickable Word Chips) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">Sentence Construction Challenge</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Type your sentence or tap words into place
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleClearSentence}
              className="btn btn-secondary btn-sm"
              title="Clear input"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Word Chips Bank */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Word Bank (Tap to insert word):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableWords.map((w, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleWordClick(w)}
                style={{
                  padding: '7px 13px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease'
                }}
                title="Tap to add to sentence"
              >
                + {w}
              </button>
            ))}
          </div>
        </div>

        {/* Full Interactive Textarea with Working Cursor & Keyboard Support */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Your Sentence (You can type, edit with cursor, or paste here):
          </label>
          <textarea
            value={typedSentence}
            onChange={(e) => {
              setTypedSentence(e.target.value);
              setSentenceChecked(false);
            }}
            placeholder="Type your sentence here, click words above, or paste a sentence..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '0.96rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Word count: <strong>{typedSentence.trim() ? typedSentence.trim().split(/\s+/).length : 0}</strong> words
          </div>

          <button
            onClick={handleCheckSentence}
            disabled={!typedSentence.trim()}
            className="btn btn-primary"
            style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle size={15} />
            <span>Check Sentence Order</span>
          </button>
        </div>

        {/* Validation Result Box */}
        {sentenceChecked && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: sentenceIsCorrect ? 'var(--success-light)' : 'var(--danger-light)',
            color: sentenceIsCorrect ? 'var(--success)' : 'var(--danger)',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: sentenceIsCorrect ? '1px solid #bbf7d0' : '1px solid #fecaca'
          }}>
            {sentenceIsCorrect ? (
              <div>
                🎉 <strong>Perfect!</strong> Your sentence is correctly ordered and punctuated.
              </div>
            ) : (
              <div>
                ⚠️ <strong>Order difference detected:</strong>
                <div style={{ marginTop: '4px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Expected: <em>"{dailyData?.sentence_builder?.correct_order}"</em>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
