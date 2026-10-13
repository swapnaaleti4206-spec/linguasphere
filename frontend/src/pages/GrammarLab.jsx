import React, { useState } from 'react';
import { api } from '../utils/api';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Copy, Check, Globe } from 'lucide-react';

export default function GrammarLab() {
  const [language, setLanguage] = useState('english');
  const [text, setText] = useState('Yesterday i is very tired and i did went to market for buy a apple.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const langPresets = {
    english: {
      title: 'English',
      flag: '🇬🇧',
      sample: 'Yesterday i is very tired and i did went to market for buy a apple.',
      sampleAlt: 'She have three children and she depends of her husband for everything.',
      placeholder: 'Type or paste English sentence to analyze...',
      label: 'Your English Text'
    },
    german: {
      title: 'German (Deutsch)',
      flag: '🇩🇪',
      sample: 'ich bin gut heute und ich habe gegangen mit der Mann.',
      sampleAlt: 'weil ich habe keine Zeit und das wetter ist gut heute.',
      placeholder: 'Deutschen Satz eingeben zur Grammatik- und Satzanalyse...',
      label: 'Your German Text (Deutscher Text)'
    },
    korean: {
      title: 'Korean (한국어)',
      flag: '🇰🇷',
      sample: '나는 학생 그리고 사과 좋아해요.',
      sampleAlt: '학교 가요 그리고 친구 같이 밥 먹었어요.',
      placeholder: '문장 교정 및 조사/존댓말 분석을 위한 한국어 문장을 입력하세요...',
      label: 'Your Korean Text (한국어 문장)'
    }
  };

  function handleLanguageChange(newLang) {
    setLanguage(newLang);
    setText(langPresets[newLang].sample);
    setResult(null);
  }

  async function handleAnalyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const data = await api.checkGrammar(text, language);
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
          Multilingual sentence checking for English, German, and Korean. Detects verb agreements, cases (Akkusativ/Dativ), Hangul particles, tenses, and elevates expression.
        </p>
      </div>

      {/* Language Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={16} /> Target Language:
        </span>
        {Object.entries(langPresets).map(([key, item]) => (
          <button
            key={key}
            onClick={() => handleLanguageChange(key)}
            className={`btn btn-sm ${language === key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: language === key ? 700 : 500 }}
          >
            <span>{item.flag}</span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Input Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{langPresets[language].label}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{text.split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={langPresets[language].placeholder}
            style={{ width: '100%', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setText(langPresets[language].sampleAlt)}
                style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sample Error 1
              </button>
              <span style={{ color: 'var(--border-light)' }}>|</span>
              <button
                onClick={() => setText(langPresets[language].sample)}
                style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sample Error 2
              </button>
            </div>
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
                Accuracy Score: {result.score} / 100
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
                    💡 Vocabulary & Pedagogical Tips:
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
              Click "Analyze & Polish" to evaluate grammar accuracy, identify linguistic mistakes, and receive elevated vocabulary suggestions in {langPresets[language].title}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
