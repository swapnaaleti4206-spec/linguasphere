import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Flame,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ user, onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, mistakesData, recsData] = await Promise.all([
        api.getDashboardStats(),
        api.getGrammarMistakes(5),
        api.getRecommendations()
      ]);
      setStats(statsData);
      setMistakes(mistakesData || []);
      setRecs(recsData || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your learning dashboard...</p>
      </div>
    );
  }

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
              CEFR {stats?.cefr_level || 'Intermediate'} Level
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back, {user?.name || 'Learner'}! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '580px' }}>
            You're on a <strong style={{ color: '#fbbf24' }}>{stats?.streak_days || 1}-day streak</strong>! Dedicating just 15 minutes today keeps your fluency progressing smoothly.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('daily')}
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            padding: '12px 20px',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <span>Start Daily 5-Min Challenge</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* 4 Core Metrics */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={26} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.streak_days || 1} Days</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily Streak</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.lessons_completed || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed Lessons</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.words_learned || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vocabulary Mastered</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.grammar_mistakes_logged || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grammar Items Logged</div>
          </div>
        </div>
      </div>

      {/* Progress & Skills Grid */}
      <div className="grid-2">
        {/* Skill Scores Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Communication Skill Competency</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: 95%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Grammar Accuracy', key: 'grammar', score: stats?.skill_scores?.grammar || 85, color: '#3b82f6' },
              { label: 'Conversational Fluency', key: 'fluency', score: stats?.skill_scores?.fluency || 80, color: '#10b981' },
              { label: 'Lexical Vocabulary Resource', key: 'vocabulary', score: stats?.skill_scores?.vocabulary || 78, color: '#8b5cf6' },
              { label: 'Pronunciation & Intonation', key: 'pronunciation', score: stats?.skill_scores?.pronunciation || 84, color: '#f59e0b' },
              { label: 'Reading & Context Comprehension', key: 'comprehension', score: stats?.skill_scores?.comprehension || 88, color: '#ec4899' },
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

        {/* Weekly Practice Minutes Chart (CSS-based Bar Chart) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Practice Activity</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Minutes per day</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
            {stats?.weekly_chart?.labels.map((day, idx) => {
              const minutes = stats.weekly_chart.practice_minutes[idx] || 15;
              const maxMinutes = 50;
              const heightPct = Math.min(100, Math.round((minutes / maxMinutes) * 100));

              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{minutes}m</span>
                  <div style={{ width: '28px', height: '120px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: idx === 4 ? 'var(--primary)' : '#93c5fd',
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

      {/* Personalized Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personalized Daily Recommendations</h3>
        </div>

        <div className="grid-2">
          {recs.map((rec, i) => (
            <div
              key={i}
              className="card"
              onClick={() => onNavigateTab(rec.action_tab)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 22px'
              }}
            >
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{rec.category}</span>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '4px 0 2px 0' }}>{rec.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{rec.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '12px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grammar Mistakes Log */}
      {mistakes.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Grammar Adjustments Log</h3>
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
