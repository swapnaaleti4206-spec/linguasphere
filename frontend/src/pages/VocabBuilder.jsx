import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { speakText } from '../utils/speech';
import { BookOpen, Volume2, Bookmark, Check, Globe2 } from 'lucide-react';

export default function VocabBuilder({ level, language = 'english' }) {
  const [words, setWords] = useState([]);
  const [savedWords, setSavedWords] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(level || 'all');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');

  useEffect(() => {
    loadVocab();
  }, [currentLevel, language]);

  async function loadVocab() {
    try {
      const data = await api.getVocabulary(language, currentLevel);
      setWords(data.curated || []);
      setSavedWords(data.saved || []);
      setActiveWordIndex(0);
      setFlipped(false);
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
    }
  }

  async function handleSaveWord(wordObj) {
    try {
      await api.saveWord({
        word: wordObj.word,
        language: language,
        phonetic: wordObj.phonetic || '',
        part_of_speech: wordObj.part_of_speech || '',
        definition: wordObj.definition,
        example: wordObj.example,
        difficulty: wordObj.difficulty || 'intermediate'
      });
      setSavedSuccess(`Saved "${wordObj.word}" to your personal bank!`);
      setTimeout(() => setSavedSuccess(''), 3000);
      const data = await api.getVocabulary(language, currentLevel);
      setSavedWords(data.saved || []);
    } catch (err) {
      console.error('Failed to save word:', err);
    }
  }

  const activeWord = words[activeWordIndex];

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {language.toUpperCase()} Vocabulary Builder & Flashcards
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            Interactive vocabulary with syllables, phonetics, definitions, and native audio pronunciation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setCurrentLevel(lvl)}
              className={`btn btn-sm ${currentLevel === lvl ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <Check size={16} />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Interactive Flashcard */}
      {activeWord && (
        <div
          className="card"
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%',
            textAlign: 'center',
            padding: '36px 32px',
            cursor: 'pointer',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onClick={() => setFlipped(!flipped)}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-primary">{activeWord.difficulty.toUpperCase()}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Card {activeWordIndex + 1} of {words.length} • Click to Flip
              </span>
            </div>

            {!flipped ? (
              <div style={{ padding: '24px 0' }}>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeWord.word}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '1rem' }}>
                    {activeWord.phonetic}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(activeWord.word, { language });
                    }}
                    style={{
                      padding: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--primary)'
                    }}
                    title={`Listen in ${language}`}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Syllables: <strong style={{ letterSpacing: '0.04em' }}>{activeWord.syllables}</strong>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (Click card to view meaning, collocations & example)
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {activeWord.part_of_speech}
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>
                  {activeWord.definition}
                </p>

                <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
                  <strong>Example:</strong> "{activeWord.example}"
                </div>

                {activeWord.collocations && (
                  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeWord.collocations.map((col, i) => (
                      <span key={i} className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                        + {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setActiveWordIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
                setFlipped(false);
              }}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>

            <button
              onClick={() => handleSaveWord(activeWord)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--primary)' }}
            >
              <Bookmark size={15} />
              <span>Save to Bank</span>
            </button>

            <button
              onClick={() => {
                setActiveWordIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
                setFlipped(false);
              }}
              className="btn btn-primary btn-sm"
            >
              Next Word
            </button>
          </div>
        </div>
      )}

      {/* Personal Vocabulary Bank */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--primary)" />
            <span>My Saved {language.toUpperCase()} Bank ({savedWords.length})</span>
          </h3>
        </div>

        {savedWords.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No saved words for {language} yet. Click "Save to Bank" on any flashcard to store vocabulary here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedWords.map((sw) => (
              <div key={sw.id} style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.98rem' }}>{sw.word}</strong>
                    {sw.phonetic && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--primary)' }}>{sw.phonetic}</span>}
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{sw.difficulty}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sw.definition}</div>
                </div>
                <button onClick={() => speakText(sw.word, { language })} className="btn btn-secondary btn-sm">
                  <Volume2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
