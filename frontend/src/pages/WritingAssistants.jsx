import React, { useState } from 'react';
import { api } from '../utils/api';
import { PenTool, Mail, FileText, BookOpen, Copy, Check, Sparkles } from 'lucide-react';

export default function WritingAssistants() {
  const [taskType, setTaskType] = useState('email');
  const [tone, setTone] = useState('formal');
  const [input, setInput] = useState('requesting two days leave next week because of a family gathering');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'email', label: 'Email Assistant', icon: Mail, placeholder: 'Describe what email you need to send (e.g., following up with a recruiter, requesting annual leave, apologizing for a delay)...' },
    { id: 'resume', label: 'Resume & LinkedIn', icon: FileText, placeholder: 'Enter your raw job achievement or task (e.g., managed team of 5 people and reduced cloud server costs)...' },
    { id: 'story', label: 'Creative Storyteller', icon: BookOpen, placeholder: 'Enter a creative plot premise or scene outline (e.g., walking through an abandoned futuristic library in Tokyo)...' }
  ];

  async function handleGenerate() {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const data = await api.assistWriting(taskType, input, tone);
      setResult(data);
    } catch (err) {
      console.error('Writing assistant failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.improved_text) return;
    navigator.clipboard.writeText(result.improved_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeTab = tabs.find((t) => t.id === taskType);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>AI Writing Assistant & Stylistic Co-Pilot</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
          Craft impactful workplace emails, high-converting resume achievements, or imaginative stories with guided tone modulation.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = taskType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setTaskType(tab.id);
                setResult(null);
              }}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Prompt & Outline</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tone:</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '0.82rem' }}
              >
                <option value="formal">Formal & Corporate</option>
                <option value="friendly">Warm & Collaborative</option>
                <option value="concise">Concise & Direct</option>
                <option value="persuasive">Persuasive & Impactful</option>
              </select>
            </div>
          </div>

          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTab?.placeholder}
            style={{ width: '100%', resize: 'vertical' }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
          >
            {loading ? 'Synthesizing...' : 'Generate Polished Content'}
            <Sparkles size={16} />
          </button>
        </div>

        {/* Output Presentation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>AI Generated Composition</span>
            {result && (
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                whiteSpace: 'pre-wrap',
                fontSize: '0.92rem',
                lineHeight: 1.6
              }}>
                {result.improved_text}
              </div>

              {result.actionable_tips && (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                    Writing Principles Applied:
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--primary-text)' }}>
                    {result.actionable_tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>{tip}</li>
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
              Select your desired tone and click "Generate Polished Content" to produce corporate-ready emails, punchy resume bullets, or vivid stories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
