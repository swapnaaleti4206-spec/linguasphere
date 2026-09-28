import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import { CalendarCheck, Flame, CheckCircle, XCircle, Volume2, RefreshCw } from 'lucide-react';

export default function DailyPractice({ level, language = 'english' }) {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [sentenceOrder, setSentenceOrder] = useState([]);
  const [sentenceChecked, setSentenceChecked] = useState(false);
  const [sentenceIsCorrect, setSentenceIsCorrect] = useState(false);

  useEffect(() => {
    loadDaily();
  }, [level, language]);

  async function loadDaily() {
    try {
      setLoading(true);
      const data = await api.getDailyPractice(language, level);
      setDailyData(data);
      setSelectedOption(null);
      setSubmittedQuiz(false);
      setSentenceChecked(false);
      if (data?.sentence_builder?.words) {
        const shuffled = [...data.sentence_builder.words].sort(() => Math.random() - 0.5);
        setSentenceOrder(shuffled);
      }
    } catch (err) {
      console.error('Failed to load daily practice:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCheckSentence() {
    const constructed = sentenceOrder.join(' ') + (language === 'korean' ? '' : '.');
    const target = dailyData.sentence_builder.correct_order;
    const isOk = constructed.toLowerCase().replace(/\s+/g, ' ').trim() === target.toLowerCase().replace(/\s+/g, ' ').trim();
    setSentenceIsCorrect(isOk);
    setSentenceChecked(true);
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading {language} practice challenge...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{dailyData?.day_title || `Daily ${language} Practice`}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            5 minutes of daily practice locks in natural idioms, sentence patterns, and grammar reflexes.
          </p>
        </div>
        <button onClick={loadDaily} className="btn btn-secondary btn-sm" title="Refresh challenge">
          <RefreshCw size={14} />
          <span>Refresh</span>
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

          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            <strong>Meaning:</strong> {dailyData?.idiom?.meaning}
          </div>

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
                    justifyContent: 'space-between'
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
            <div style={{ fontSize: '0.82rem', padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
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
            <button onClick={() => speakText(dailyData?.dialogue_scenario?.suggested_opening, { language })} className="btn btn-secondary btn-sm">
              <Volume2 size={14} /> Listen to Example
            </button>
          </div>
        </div>
      </div>

      {/* Sentence Construction Puzzle */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-primary">Sentence Construction Challenge</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click words to rearrange</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
          {sentenceOrder.map((w, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx < sentenceOrder.length - 1) {
                  const copy = [...sentenceOrder];
                  const temp = copy[idx];
                  copy[idx] = copy[idx + 1];
                  copy[idx + 1] = temp;
                  setSentenceOrder(copy);
                  setSentenceChecked(false);
                }
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                fontWeight: 600,
                fontSize: '0.86rem'
              }}
              title="Click to shift right"
            >
              {w}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Current: <em>"{sentenceOrder.join(' ')}"</em>
          </span>

          <button onClick={handleCheckSentence} className="btn btn-primary btn-sm">
            Check Order
          </button>
        </div>

        {sentenceChecked && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: sentenceIsCorrect ? 'var(--success-light)' : 'var(--danger-light)',
            color: sentenceIsCorrect ? 'var(--success)' : 'var(--danger)',
            fontSize: '0.86rem',
            fontWeight: 600
          }}>
            {sentenceIsCorrect ? '🎉 Perfectly arranged!' : `Not quite. Correct sentence is: "${dailyData.sentence_builder.correct_order}"`}
          </div>
        )}
      </div>
    </div>
  );
}
