import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import { Languages, Volume2, CheckCircle2, XCircle, Flame, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

export default function TeluguQuiz({ language = 'english', onStreakUpdated }) {
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionReward, setCompletionReward] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, [language]);

  async function loadQuizzes() {
    try {
      setLoading(true);
      const data = await api.getTeluguQuizzes(language);
      setQuizzes(data || []);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setQuizFinished(false);
      setCompletionReward(null);
    } catch (err) {
      console.error('Failed to load Telugu quizzes:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentQuiz = quizzes[currentIndex];

  async function handleOptionSelect(idx) {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuiz.correct_index;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    // If last question, finish and award real streak!
    if (currentIndex === quizzes.length - 1) {
      setQuizFinished(true);
      try {
        const finalPct = Math.round((newScore / quizzes.length) * 100);
        const res = await api.completeTask(`Telugu Translation Quiz (${language})`, language, finalPct);
        setCompletionReward(res);
        if (onStreakUpdated) {
          onStreakUpdated(res.streak_days);
        }
      } catch (err) {
        console.error('Failed to record task completion:', err);
      }
    }
  }

  function handleNextQuestion() {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Telugu translation quiz...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Languages size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Telugu Translation Quiz (తెలుగు అనువాద క్విజ్)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Practice two-way translation between {language.toUpperCase()} and Telugu. Complete the quiz to earn your real-time daily streak!
          </p>
        </div>

        <button onClick={loadQuizzes} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>New Quiz</span>
        </button>
      </div>

      {!quizFinished && currentQuiz ? (
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto', width: '100%', padding: '32px' }}>
          {/* Header Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span className="badge badge-primary">{currentQuiz.direction_title}</span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Question {currentIndex + 1} of {quizzes.length}
            </span>
          </div>

          {/* Reading Sentence Box */}
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                Sentence to Read & Translate:
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                "{currentQuiz.source_sentence}"
              </div>
            </div>

            {currentQuiz.direction === 'to_telugu' && (
              <button
                onClick={() => speakText(currentQuiz.source_sentence, { language })}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title="Listen with native audio"
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQuiz.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQuiz.correct_index;

              let bg = 'var(--bg-surface)';
              let border = 'var(--border-light)';
              if (isAnswered) {
                if (isCorrect) {
                  bg = 'var(--success-light)';
                  border = 'var(--success)';
                } else if (isSelected) {
                  bg = 'var(--danger-light)';
                  border = 'var(--danger)';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleOptionSelect(optIdx)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${border}`,
                    backgroundColor: bg,
                    textAlign: 'left',
                    fontSize: '0.94rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span style={{ lineHeight: 1.4 }}>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="var(--success)" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="var(--danger)" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div style={{
              marginTop: '20px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>వివరణ (Explanation):</strong> {currentQuiz.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && currentIndex < quizzes.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '12px' }}
            >
              <span>Next Question</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      ) : (
        /* Quiz Completed Celebration Card */
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Sparkles size={32} />
          </div>

          <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Telugu Translation Quiz Completed!</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Score: <strong>{score}</strong> / {quizzes.length} Correct ({Math.round((score / quizzes.length) * 100)}%)
          </p>

          {completionReward && (
            <div style={{
              margin: '24px 0',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Flame size={24} fill="#f59e0b" color="#f59e0b" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {completionReward.streak_days} Day Streak Earned! 🔥
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  Real-time streak unlocked! Total completed lessons: {completionReward.lessons_completed}
                </div>
              </div>
            </div>
          )}

          <button onClick={loadQuizzes} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Practice More Telugu Quizzes
          </button>
        </div>
      )}
    </div>
  );
}
