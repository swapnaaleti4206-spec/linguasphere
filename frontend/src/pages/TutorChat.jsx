import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { speakText, createSpeechRecognizer } from '../utils/speech';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Globe2,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function TutorChat({ user, level, language = 'english' }) {
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [englishOnly, setEnglishOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const recognizerRef = useRef(null);

  const langGreetings = {
    english: `Hello ${user?.name || 'Swapna'}! I'm your LinguaSphere AI Language Tutor. 🌟\nHow can I help you practice today? Feel free to chat, ask about grammar rules, check vocabulary, or practice Telugu-English translations!`,
    german: `Hallo ${user?.name || 'Swapna'}! Willkommen beim LinguaSphere Deutsch-Tutor. 🇩🇪✨\nWorüber möchtest du heute sprechen? Wir können Alltagsgespräche, Artikel (der/die/das) oder Grammatik üben!`,
    korean: `안녕하세요 ${user?.name || '스왑나'}님! 링구아스피어 AI 한국어 튜터입니다. 🇰🇷✨\n오늘 어떤 한국어 회화 표현이나 문법을 연습해 볼까요?`
  };

  const starterChips = {
    english: [
      "🗣️ Practice daily small talk",
      "📝 Check: 'She don't know the answer'",
      "📖 Meaning & Telugu: Resilience",
      "💼 Practice a Job Interview question",
      "🇮🇳 Translate: 'నేను రేపు పరీక్ష రాయాలి'"
    ],
    german: [
      "🇩🇪 Der, Die, Das Regeln",
      "🗣️ Alltagsgespräch: Wie geht es dir?",
      "📝 Grammatik prüfen: 'Ich bin gut heute'"
    ],
    korean: [
      "🇰🇷 은/는 vs 이/가 조사 차이점",
      "🗣️ 한국어 일상 회화 인사말",
      "📝 문장 고쳐주세요: '나는 학생'"
    ]
  };

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: langGreetings[language] || langGreetings.english,
        corrections: [],
        suggestions: []
      }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(textToSend) {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await api.sendMessage(sessionId, userText, level, language, englishOnly, 'tutor');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          corrections: res.corrections || [],
          suggestions: res.suggestions || [],
          isError: false
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'The language server is currently waking up or connecting. Please tap below to retry your message.',
          isError: true,
          failedText: userText,
          corrections: [],
          suggestions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    if (e) e.preventDefault();
    sendMessage(input);
  }

  function handleRetry(failedText) {
    if (failedText) {
      sendMessage(failedText);
    }
  }

  function toggleVoiceRecording() {
    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const rec = createSpeechRecognizer(
      language,
      ({ final, interim }) => {
        if (final) {
          setInput((prev) => (prev ? `${prev} ${final}` : final));
        }
      },
      (error) => {
        console.error('Speech error:', error);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (!rec) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    recognizerRef.current = rec;
    rec.start();
    setIsRecording(true);
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe2 size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Live {language.toUpperCase()} AI Tutor Studio
          </span>
          <span className="badge badge-primary">{level.toUpperCase()}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const isErr = m.isError;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '6px'
              }}
            >
              <div style={{
                maxWidth: '78%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isUser
                  ? 'var(--primary)'
                  : isErr
                  ? 'var(--danger-light)'
                  : 'var(--bg-secondary)',
                color: isUser
                  ? '#ffffff'
                  : isErr
                  ? 'var(--danger)'
                  : 'var(--text-primary)',
                fontSize: '0.94rem',
                lineHeight: 1.5,
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
                border: isErr ? '1px solid #fecaca' : 'none'
              }}>
                {isErr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                    <AlertCircle size={15} />
                    <span>Connection Notice</span>
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>

                {/* Pronounce ONLY for real assistant learning messages, NEVER on error messages */}
                {!isUser && !isErr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => speakText(m.content, { language })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-light)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title={`Listen in ${language}`}
                    >
                      <Volume2 size={14} />
                      <span>Pronounce ({language})</span>
                    </button>
                  </div>
                )}

                {/* Retry button on error messages */}
                {isErr && m.failedText && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleRetry(m.failedText)}
                      disabled={loading}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RotateCcw size={13} />
                      <span>Retry Message</span>
                    </button>
                  </div>
                )}
              </div>

              {!isUser && !isErr && m.corrections && m.corrections.length > 0 && (
                <div style={{
                  maxWidth: '78%',
                  backgroundColor: 'var(--warning-light)',
                  border: '1px solid #fef08a',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} />
                    <span>Language Insights:</span>
                  </div>
                  {m.corrections.map((c, ci) => (
                    <div key={ci} style={{ color: '#713f12' }}>
                      <span style={{ textDecoration: 'line-through', opacity: 0.8 }}>{c.original}</span>
                      {' → '}
                      <strong>{c.correction}</strong>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>{c.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {!isUser && !isErr && m.suggestions && m.suggestions.length > 0 && (
                <div style={{
                  maxWidth: '78%',
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  color: 'var(--primary-text)'
                }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Lightbulb size={13} />
                    <span>Vocabulary & Expression Booster:</span>
                  </div>
                  {m.suggestions.map((s, si) => (
                    <div key={si}>{s}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Sparkles size={16} />
            <span>AI Tutor is formulating personalized feedback in {language}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Interactive Prompt Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0 2px 0',
        scrollbarWidth: 'none'
      }}>
        {(starterChips[language] || starterChips.english).map((chip, ci) => (
          <button
            key={ci}
            type="button"
            onClick={() => sendMessage(chip.replace(/^[^\w\s]+\s*/, ''))}
            disabled={loading}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '0.78rem',
              padding: '5px 11px',
              borderRadius: '20px',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
          style={{ width: '48px', height: '48px', padding: 0, flexShrink: 0 }}
          title={isRecording ? 'Stop Recording' : `Speak in ${language}`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? `Listening in ${language}...` : `Type your message or ask a question in ${language}...`}
          style={{ flex: 1, padding: '12px 16px', fontSize: '0.96rem' }}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0 22px' }}
        >
          <span>Send</span>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
