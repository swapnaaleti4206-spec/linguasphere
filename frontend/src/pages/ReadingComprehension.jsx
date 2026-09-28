import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BookMarked, CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';

export default function ReadingComprehension({ level }) {
  const [exercises, setExercises] = useState([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [level]);

  function loadExercises() {
    const list = api.getReadingExercises(level);
    // In our api helper getReadingExercises returns a promise, so let's await or handle
    Promise.resolve(list).then((data) => {
      setExercises(data || []);
      setActiveExerciseIndex(0);
      setAnswers({});
      setSubmitted(false);
    });
  }

  const currentEx = exercises[activeExerciseIndex];

  function handleSelectAnswer(qIdx, optIdx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  }

  function calculateScore() {
    if (!currentEx) return 0;
    let correct = 0;
    currentEx.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    return correct;
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Reading Comprehension & Critical Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
          Engage with curated editorial passages, expand contextual vocabulary, and test your understanding with precision.
        </p>
      </div>

      {currentEx && (
        <div className="grid-2">
          {/* Article Passage & Vocab */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-primary">{currentEx.level.toUpperCase()}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Article {activeExerciseIndex + 1} of {exercises.length}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentEx.title}</h3>

            <p style={{ fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
              {currentEx.passage}
            </p>

            {/* Key Vocabulary Highlight */}
            {currentEx.key_vocabulary && (
              <div style={{ marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} />
                  <span>Key Lexical Terms:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentEx.key_vocabulary.map((v, i) => (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{v.word}:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{v.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Comprehension Questions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Comprehension Questions</span>
              {submitted && (
                <span className="badge badge-success">
                  Score: {calculateScore()} / {currentEx.questions.length} Correct
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {currentEx.questions.map((q, qIdx) => {
                const isUserCorrect = answers[qIdx] === q.correct;

                return (
                  <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                      {qIdx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[qIdx] === optIdx;
                        let bg = 'var(--bg-secondary)';
                        let border = 'var(--border-light)';

                        if (submitted) {
                          if (optIdx === q.correct) {
                            bg = 'var(--success-light)';
                            border = 'var(--success)';
                          } else if (isSelected) {
                            bg = 'var(--danger-light)';
                            border = 'var(--danger)';
                          }
                        } else if (isSelected) {
                          bg = 'var(--primary-light)';
                          border = 'var(--primary)';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              border: `1px solid ${border}`,
                              backgroundColor: bg,
                              textAlign: 'left',
                              fontSize: '0.86rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{opt}</span>
                            {submitted && optIdx === q.correct && <CheckCircle2 size={15} color="var(--success)" />}
                            {submitted && isSelected && !isUserCorrect && <XCircle size={15} color="var(--danger)" />}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < currentEx.questions.length}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', marginTop: '10px' }}
              >
                Submit Answers
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setActiveExerciseIndex((prev) => (prev < exercises.length - 1 ? prev + 1 : 0));
                }}
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-end', marginTop: '10px' }}
              >
                Next Passage →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
