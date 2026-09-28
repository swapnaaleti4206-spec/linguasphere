import React, { useState } from 'react';
import { api } from '../utils/api';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';

export default function GrammarLab() {
  const [text, setText] = useState('Yesterday i is very tired and i did went to market for buy a apple.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleAnalyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const data = await api.checkGrammar(text);
      setResult(data);
    } catch (err) {
      console.error('Grammar check failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.corrected_text) return;
    navigator.clipboard.writeText(result.corrected_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Grammar Correction & Sentence Improvement Lab</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
          Paste any sentence, email draft, or paragraph. AI analyzes grammar mistakes, prepositions, tenses, and elevates your wording.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Your English Text</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{text.split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste English text to analyze..."
            style={{ width: '100%', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setText('She have three children and she depends of her husband for everything.')}
              style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Try sample error
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Analyzing...' : 'Analyze & Polish'}
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Polished Version</span>
            {result && (
              <span className={`badge ${result.score >= 90 ? 'badge-success' : 'badge-warning'}`}>
                Fluency Score: {result.score} / 100
              </span>
            )}
          </div>

          {result ? (
            <>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                fontSize: '0.96rem',
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                {result.corrected_text}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                  {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Polished Text'}</span>
                </button>
              </div>

              {/* Identified Corrections */}
              {result.corrections && result.corrections.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} />
                    <span>Identified Grammar Adjustments ({result.corrections.length}):</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.corrections.map((c, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', fontSize: '0.82rem' }}>
                        <strong style={{ color: 'var(--danger)' }}>{c.original}</strong> → <strong style={{ color: 'var(--success)' }}>{c.correction}</strong>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{c.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Vocabulary Improvements */}
              {result.improvements && result.improvements.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                    💡 Vocabulary & Stylistic Enhancements:
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {result.improvements.map((imp, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
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
              Click "Analyze & Polish" to evaluate grammar accuracy, identify mistakes, and receive elevated vocabulary suggestions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
