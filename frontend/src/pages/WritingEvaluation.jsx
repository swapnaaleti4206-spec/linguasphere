import React, { useState } from 'react';
import { api } from '../utils/api';
import { Award, Sparkles, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function WritingEvaluation() {
  const [prompt, setPrompt] = useState('Some people believe that remote work enhances productivity, while others argue it hinders teamwork. Discuss both views and give your opinion.');
  const [essay, setEssay] = useState('In recent years, the debate surrounding remote work has gained substantial prominence. While advocates argue that working from home diminishes daily commute stress and fosters deeper focus, detractors contend that in-person collaboration is pivotal for team synergy. In my perspective, a balanced hybrid model provides the most effective compromise.');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleEvaluate() {
    if (!essay.trim() || loading) return;
    setLoading(true);
    try {
      const data = await api.evaluateWriting(essay, prompt);
      setEvaluation(data);
    } catch (err) {
      console.error('Writing evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Formal Writing Evaluation & CEFR Rubric</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
          Evaluate your essays, reports, and arguments using international 4-pillar benchmarks (Task Achievement, Coherence, Lexicon, and Grammar).
        </p>
      </div>

      <div className="grid-2">
        {/* Submission Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
              Writing Prompt / Topic
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>Your Essay / Submission</label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{essay.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              rows={12}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write or paste your paragraph/essay here..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading || !essay.trim()}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
          >
            {loading ? 'Evaluating Submission...' : 'Evaluate Writing'}
            <Sparkles size={16} />
          </button>
        </div>

        {/* Evaluation Rubric Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Assessment Scorecard</span>
            {evaluation && (
              <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                Overall Band: <strong>{evaluation.overall_score}</strong> / 9.0
              </div>
            )}
          </div>

          {evaluation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 4 Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { title: 'Task Achievement', key: 'task_achievement', color: '#3b82f6' },
                  { title: 'Coherence & Cohesion', key: 'coherence_and_cohesion', color: '#10b981' },
                  { title: 'Lexical Resource', key: 'lexical_resource', color: '#8b5cf6' },
                  { title: 'Grammar Accuracy', key: 'grammatical_accuracy', color: '#f59e0b' },
                ].map((pillar) => {
                  const data = evaluation.rubric_breakdown[pillar.key];
                  return (
                    <div key={pillar.key} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{pillar.title}</span>
                        <strong style={{ color: pillar.color, fontSize: '0.95rem' }}>{data?.score} / 9</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{data?.feedback}</div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {evaluation.suggested_improvements && evaluation.suggested_improvements.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>Key Recommendations for Higher Band:</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '4px', color: 'var(--primary-text)' }}>
                    {evaluation.suggested_improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              Submit your writing to receive a comprehensive 4-pillar IELTS/CEFR evaluation band score with personalized advice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
