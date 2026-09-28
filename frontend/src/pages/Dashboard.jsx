import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Flame,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Languages,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ user, onNavigateTab, language = 'english' }) {
  const [stats, setStats] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [language]);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, mistakesData] = await Promise.all([
        api.getDashboardStats(),
        api.getGrammarMistakes(5)
      ]);
      setStats(statsData);
      setMistakes(mistakesData || []);
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

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 32px'
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
              <>Your streak is currently at <strong style={{ color: '#fbbf24' }}>0 days</strong>. Complete your first Telugu Translation Quiz or Daily Challenge below to unlock your 1-day streak!</>
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

      {/* 4 Core Real-Time Metrics */}
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

      {/* Progress & Skills Grid */}
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

      {/* Suggested Next Actions */}
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
            onClick={() => onNavigateTab('chat')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px' }}
          >
            <div>
              <span className="badge badge-success" style={{ marginBottom: '6px' }}>AI Tutor</span>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '4px 0 2px 0' }}>Live AI Tutor Chat in {language.toUpperCase()}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Chat freely and get instant corrections and phrase improvements.</p>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '12px' }} />
          </div>
        </div>
      </div>

      {/* Recent Grammar Mistakes Log */}
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
