import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import {
  Flame,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Languages,
  ChevronRight,
  Mic,
  Volume2,
  CalendarCheck,
  Quote
} from 'lucide-react';

export default function Dashboard({ user, onNavigateTab, language = 'english' }) {
  const [stats, setStats] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultIdioms = {
    english: {
      phrase: "Hit the nail on the head",
      meaning: "To describe exactly what is causing a situation or problem.",
      telugu_meaning: "సరిగ్గా చెప్పడం / వాస్తవాన్ని కచ్చితంగా వ్యక్తపరచడం",
      example: "Swapna hit the nail on the head when presenting the project roadmap."
    },
    german: {
      phrase: "Daumen drücken",
      meaning: "To cross one's fingers; wish someone good luck.",
      telugu_meaning: "మంచి జరగాలని కోరుకోవడం (ఆల్ ది బెస్ట్ చెప్పడం)",
      example: "Ich drücke dir für deine morgige Präsentation ganz fest die Daumen!"
    },
    korean: {
      phrase: "발이 넓다 (Bal-i neolp-da)",
      meaning: "To have a wide circle of acquaintances; well-connected.",
      telugu_meaning: "చాలా మంది పరిచయస్థులు మరియు మంచి సంబంధాలు కలిగి ఉండడం",
      example: "그분은 발이 넓어서 아는 사람이 아주 많아요."
    }
  };

  useEffect(() => {
    loadData();
  }, [language]);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, mistakesData, dailyPracticeData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getGrammarMistakes(5).catch(() => []),
        api.getDailyPractice(language, user?.level || 'intermediate').catch(() => null)
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

  const currentIdiom = dailyData?.idiom?.phrase
    ? dailyData.idiom
    : (defaultIdioms[language] || defaultIdioms.english);

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
      {/* 3. FEATURED IDIOM OF THE DAY CARD (నేటి జాతీయం / సామెత) */}
      {/* ========================================================================= */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05))',
        border: '1.5px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              color: '#d97706',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              🌟 Idiom of the Day ({language.toUpperCase()})
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              • నేటి జాతీయం / సామెత
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => speakText(currentIdiom.phrase, { language })}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Pronounce idiom aloud"
            >
              <Volume2 size={16} color="#d97706" />
              <span>Listen Pronunciation</span>
            </button>

            <button
              onClick={() => onNavigateTab('daily')}
              className="btn btn-sm"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Daily Practice & Puzzles</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Idiom Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <Quote size={24} color="#d97706" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}>
            "{currentIdiom.phrase}"
          </h3>
        </div>

        {/* Meaning & Telugu Translation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}>
          <div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Meaning in English:
            </strong>
            <div style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
              {currentIdiom.meaning}
            </div>
          </div>

          {currentIdiom.telugu_meaning && (
            <div>
              <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase' }}>
                తెలుగు అర్థం (Telugu Nuance):
              </strong>
              <div style={{ fontSize: '0.94rem', color: 'var(--primary-text)', fontWeight: 700, marginTop: '2px' }}>
                {currentIdiom.telugu_meaning}
              </div>
            </div>
          )}
        </div>

        {/* Practical Example */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>In Context:</strong> "{currentIdiom.example}"
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
