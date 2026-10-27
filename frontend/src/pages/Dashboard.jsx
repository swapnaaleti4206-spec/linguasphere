import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import { getDailyIdiomAndWord } from '../utils/dailyCurriculum';
import {
  Flame,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Languages,
  ChevronRight,
  ChevronLeft,
  Mic,
  Volume2,
  CalendarCheck,
  Quote,
  Shuffle,
  BookmarkPlus,
  Calendar,
  Check
} from 'lucide-react';

export default function Dashboard({ user, onNavigateTab, language = 'english' }) {
  const [stats, setStats] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic daily rotation & shuffle state
  const [dayOffset, setDayOffset] = useState(0);
  const [idiomOffset, setIdiomOffset] = useState(0);
  const [wordOffset, setWordOffset] = useState(0);
  const [savingWord, setSavingWord] = useState(false);
  const [savedWordSuccess, setSavedWordSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [language, dayOffset]);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, mistakesData, dailyPracticeData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getGrammarMistakes(5).catch(() => []),
        api.getDailyPractice(language, user?.level || 'intermediate', dayOffset).catch(() => null)
      ]);
      setStats(statsData);
      setMistakes(mistakesData || []);
      setDailyData(dailyPracticeData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWord(wordObj) {
    if (!wordObj) return;
    try {
      setSavingWord(true);
      await api.saveWord({
        language,
        word: wordObj.word,
        phonetic: wordObj.phonetic || '',
        part_of_speech: wordObj.part_of_speech || 'word',
        definition: wordObj.definition || '',
        example: wordObj.example || '',
        difficulty: wordObj.difficulty || 'intermediate'
      });
      setSavedWordSuccess(true);
      setTimeout(() => setSavedWordSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save word:', err);
    } finally {
      setSavingWord(false);
    }
  }

  const localDaily = getDailyIdiomAndWord(language, dayOffset);
  const localIdiomAlt = getDailyIdiomAndWord(language, dayOffset + idiomOffset);
  const localWordAlt = getDailyIdiomAndWord(language, dayOffset + wordOffset);

  const currentIdiom = (dailyData?.idiom?.phrase && idiomOffset === 0)
    ? dailyData.idiom
    : localIdiomAlt.idiom;

  const currentWord = (dailyData?.word_of_the_day?.word && wordOffset === 0)
    ? dailyData.word_of_the_day
    : localWordAlt.word;

  const displayDateStr = dailyData?.date_str || localDaily.dateStr;

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading real-time learning metrics...</p>
      </div>
    );
  }

  const streakDays = stats?.streak_days || 0;
  const lessonsCount = stats?.lessons_completed || 0;
  const wordsCount = stats?.words_learned || 0;
  const mistakesCount = stats?.grammar_mistakes_logged || 0;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-warning" style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)' }}>
              Language: {language.toUpperCase()} • Level: {user?.level?.toUpperCase() || 'INTERMEDIATE'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back, {user?.name || 'Swapna Aleti'}! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '580px' }}>
            {streakDays > 0 ? (
              <>You have an active <strong style={{ color: '#fbbf24' }}>{streakDays}-day streak</strong>! Keep it going with today's practice.</>
            ) : (
              <>Your streak is currently at <strong style={{ color: '#fbbf24' }}>0 days</strong>. Complete your first Telugu Translation Quiz or Speaking Challenge below to unlock your 1-day streak!</>
            )}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('telugu')}
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            padding: '12px 20px',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 700
          }}
        >
          <Languages size={18} />
          <span>Telugu Translation Quiz</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* 2. Four Core Real-Time Metrics */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: streakDays > 0 ? '#fef3c7' : 'var(--bg-secondary)', color: streakDays > 0 ? '#d97706' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={26} fill={streakDays > 0 ? 'currentColor' : 'none'} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{streakDays} Days</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily Streak</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{lessonsCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lessons Completed</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{wordsCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Words Saved in Bank</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{mistakesCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grammar Items Logged</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC DAILY DISCOVERY HUB: IDIOM OF THE DAY & WORD OF THE DAY */}
      {/* ========================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Control Bar with Calendar Date & Day Navigation */}
        <div className="card" style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(59, 130, 246, 0.08))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Calendar size={15} /> Daily Hub ({language.toUpperCase()})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {displayDateStr}
              </span>
              {dayOffset === 0 ? (
                <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                  Today's Edition 🌟
                </span>
              ) : (
                <span className="badge badge-warning" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  {dayOffset > 0 ? `+${dayOffset} Days Ahead` : `${Math.abs(dayOffset)} Days Ago`}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Date Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setDayOffset(prev => prev - 1);
                setIdiomOffset(0);
                setWordOffset(0);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="View previous day's edition"
            >
              <ChevronLeft size={16} />
              <span>Prev Day</span>
            </button>

            {dayOffset !== 0 && (
              <button
                onClick={() => {
                  setDayOffset(0);
                  setIdiomOffset(0);
                  setWordOffset(0);
                }}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Today 📅</span>
              </button>
            )}

            <button
              onClick={() => {
                setDayOffset(prev => prev + 1);
                setIdiomOffset(0);
                setWordOffset(0);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="View next day's edition"
            >
              <span>Next Day</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Grid: Idiom on Left, Word of the Day on Right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {/* ========================================================================= */}
          {/* CARD 1: IDIOM OF THE DAY (నేటి జాతీయం / సామెత) */}
          {/* ========================================================================= */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04))',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.07)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                  color: '#d97706',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  🌟 Idiom of the Day
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  • నేటి జాతీయం
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setIdiomOffset(prev => prev + 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '0.78rem' }}
                  title="Shuffle to another curated idiom"
                >
                  <Shuffle size={14} color="#d97706" />
                  <span>Next Idiom 🔀</span>
                </button>

                <button
                  onClick={() => speakText(currentIdiom.phrase, { language })}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '0.78rem' }}
                  title="Pronounce idiom aloud"
                >
                  <Volume2 size={14} color="#d97706" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            {/* Idiom Phrase */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <Quote size={22} color="#d97706" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.3
              }}>
                "{currentIdiom.phrase}"
              </h3>
            </div>

            {/* Meaning & Telugu Nuance */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  English Meaning:
                </strong>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {currentIdiom.meaning}
                </div>
              </div>

              {currentIdiom.telugu_meaning && (
                <div>
                  <strong style={{ fontSize: '0.78rem', color: '#d97706', textTransform: 'uppercase' }}>
                    తెలుగు అర్థం (Telugu Nuance):
                  </strong>
                  <div style={{ fontSize: '0.92rem', color: '#b45309', fontWeight: 700, marginTop: '2px' }}>
                    {currentIdiom.telugu_meaning}
                  </div>
                </div>
              )}
            </div>

            {/* In Context Example */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>In Context:</strong> "{currentIdiom.example}"
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: WORD OF THE DAY (నేటి పదం & ఉచ్చారణ) */}
          {/* ========================================================================= */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.04))',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.07)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  color: '#059669',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  📖 Word of the Day • {currentWord.part_of_speech || 'Vocabulary'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  • నేటి పదం
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setWordOffset(prev => prev + 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '0.78rem' }}
                  title="Shuffle to another curated vocabulary word"
                >
                  <Shuffle size={14} color="#059669" />
                  <span>Next Word 🔀</span>
                </button>

                <button
                  onClick={() => speakText(currentWord.word, { language })}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '0.78rem' }}
                  title="Pronounce word aloud"
                >
                  <Volume2 size={14} color="#059669" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            {/* Word Display & Phonetic */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
                }}>
                  {currentWord.word}
                </h3>
                {currentWord.phonetic && (
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#059669',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {currentWord.phonetic}
                  </span>
                )}
                {currentWord.syllables && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Syllables: <strong>{currentWord.syllables}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Meaning & Telugu Nuance */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  English Definition:
                </strong>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {currentWord.definition}
                </div>
              </div>

              {currentWord.telugu_meaning && (
                <div>
                  <strong style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase' }}>
                    తెలుగు అర్థం (Telugu Nuance):
                  </strong>
                  <div style={{ fontSize: '0.92rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                    {currentWord.telugu_meaning}
                  </div>
                </div>
              )}
            </div>

            {/* In Context Example */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>In Context:</strong> "{currentWord.example}"
            </div>

            {/* Save to Vocabulary Bank Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
              <button
                onClick={() => handleSaveWord(currentWord)}
                disabled={savingWord || savedWordSuccess}
                className="btn btn-secondary btn-sm"
                style={{
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: savedWordSuccess ? '#059669' : 'inherit'
                }}
              >
                {savedWordSuccess ? (
                  <>
                    <Check size={16} color="#059669" />
                    <span style={{ color: '#059669' }}>Saved to Bank!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} color="#059669" />
                    <span>{savingWord ? 'Saving...' : 'Save to My Bank'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigateTab('daily')}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Daily Challenges</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. 100% FREE AI ENGLISH SPEAKING PRACTICE STUDIO SECTION */}
      {/* ========================================================================= */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(79, 70, 229, 0.08))',
        border: '1.5px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Left Column: Story & Call to Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={15} /> 100% Free • No Subscription Required
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                Coach Sarah 👩‍💼
              </span>
            </div>

            <h3 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: 'var(--text-primary)'
            }}>
              Practice Speaking English with AI <span style={{ color: 'var(--primary)' }}>Real-Time & Free</span>
            </h3>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.96rem',
              lineHeight: 1.6
            }}>
              Most language platforms lock speaking practice behind expensive paid paywalls. 
              We believe conversational fluency should be accessible to everyone! 
              Practice spoken English freely with your personal AI partner—speak into your microphone, 
              hear natural audio replies, receive instant grammar and pronunciation tips, and conquer speaking hesitation.
            </p>

            {/* Feature Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              padding: '12px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Mic size={18} color="var(--primary)" /> Real-Time Voice Input
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Volume2 size={18} color="var(--primary)" /> Coach Sarah Audio Responses
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <CheckCircle size={18} color="#16a34a" /> Instant Fluency Feedback
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <CalendarCheck size={18} color="var(--primary)" /> Structured 2-Person Dialogue
              </div>
            </div>

            {/* Action Button Below Info */}
            <div style={{ paddingTop: '6px' }}>
              <button
                onClick={() => onNavigateTab('speaking')}
                className="btn btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Mic size={20} />
                <span>Start AI Speaking Practice</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Image Describing AI and Human Practicing Speaking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <img
                src="/ai_human_speaking.jpg"
                alt="AI and Human Practicing English Speaking"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '340px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 600 }}>🎙️ Interactive Voice Practice</span>
                <span style={{ opacity: 0.85 }}>Human Learner ↔ Coach Sarah</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Speak naturally, simulate conversations, and build effortless fluency without expensive subscription fees.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Progress & Skills Grid */}
      <div className="grid-2">
        {/* Real-time Skill Competency */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Real-Time Competency ({language.toUpperCase()})</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: 100%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Grammar Accuracy', key: 'grammar', score: stats?.skill_scores?.grammar || 0, color: '#3b82f6' },
              { label: 'Conversational Fluency', key: 'fluency', score: stats?.skill_scores?.fluency || 0, color: '#10b981' },
              { label: 'Lexical Vocabulary Resource', key: 'vocabulary', score: stats?.skill_scores?.vocabulary || 0, color: '#8b5cf6' },
              { label: 'Pronunciation & Intonation', key: 'pronunciation', score: stats?.skill_scores?.pronunciation || 0, color: '#f59e0b' },
              { label: 'Translation & Comprehension', key: 'comprehension', score: stats?.skill_scores?.comprehension || 0, color: '#ec4899' },
            ].map((skill) => (
              <div key={skill.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>{skill.label}</span>
                  <span style={{ color: skill.color }}>{skill.score}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.score}%`, height: '100%', backgroundColor: skill.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Practice Minutes Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Real Practice Activity</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Minutes per day</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
            {stats?.weekly_chart?.labels.map((day, idx) => {
              const minutes = stats.weekly_chart.practice_minutes[idx] || 0;
              const maxMinutes = 60;
              const heightPct = Math.min(100, Math.round((minutes / maxMinutes) * 100));

              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{minutes}m</span>
                  <div style={{ width: '28px', height: '120px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: minutes > 0 ? 'var(--primary)' : 'transparent',
                      borderRadius: '6px'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Suggested Learning Practices */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Start Your Learning Practice</h3>
        </div>

        <div className="grid-2">
          <div
            className="card"
            onClick={() => onNavigateTab('telugu')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' }}
          >
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Interactive Quiz</span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '4px 0 2px 0' }}>Telugu Translation Quiz (తెలుగు క్విజ్)</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Read sentences and practice two-way translation into Telugu and vice versa.</p>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '12px' }} />
          </div>

          <div
            className="card"
            onClick={() => onNavigateTab('daily')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' }}
          >
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '6px' }}>Daily Idiom & Reflex</span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '4px 0 2px 0' }}>Daily Idiom Workout & Sentence Construction</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>5-minute daily challenges with idiom context, grammar puzzles, and sentence builders.</p>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '12px' }} />
          </div>
        </div>
      </div>

      {/* 7. Recent Grammar Mistakes Log */}
      {mistakes.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Logged Grammar Adjustments</h3>
            <button
              onClick={() => onNavigateTab('grammar')}
              style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Open Grammar Lab →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mistakes.map((m) => (
              <div key={m.id} style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.86rem'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{m.original_text}</span>
                  <span>→</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>{m.corrected_text}</span>
                  <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>{m.category}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
