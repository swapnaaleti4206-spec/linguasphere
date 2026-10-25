import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import { speakText, createSpeechRecognizer } from '../utils/speech';
import {
  Mic,
  MicOff,
  Volume2,
  Briefcase,
  Users,
  Megaphone,
  Coffee,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowRight
} from 'lucide-react';

export default function SpeakingPractice({ user, level, language = 'english' }) {
  const [selectedMode, setSelectedMode] = useState('interview');
  const [topic, setTopic] = useState('Behavioral Strengths & Problem Solving');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionTurns, setSessionTurns] = useState([]);

  const recognizerRef = useRef(null);
  const inputSectionRef = useRef(null);

  const modes = [
    {
      id: 'interview',
      label: 'Job Interview Prep',
      icon: Briefcase,
      desc: 'Simulate behavioral and technical interviews with instant STAR structure evaluation.',
      defaultTopic: 'Handling high-pressure deadlines & conflict resolution'
    },
    {
      id: 'discussion',
      label: 'Group Discussion Forum',
      icon: Users,
      desc: 'Participate in a multi-stakeholder debate with virtual dialogue partners.',
      defaultTopic: 'Remote work vs In-office collaboration culture'
    },
    {
      id: 'public_speaking',
      label: 'Public Speaking & Pitch',
      icon: Megaphone,
      desc: 'Practice presentation openings, TED-style storytelling hooks, and confident cadence.',
      defaultTopic: 'Introducing an innovative sustainability solution'
    },
    {
      id: 'casual',
      label: 'Everyday Conversation',
      icon: Coffee,
      desc: 'Natural spontaneous dialogues about hobbies, travels, and workplace small talk.',
      defaultTopic: 'Planning an international weekend getaway'
    }
  ];

  function handleSelectMode(m) {
    setSelectedMode(m.id);
    setTopic(m.defaultTopic);
    setSessionTurns([]);
    setTurnCount(1);
  }

  function handleStartSpeakingClick() {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isRecording) {
      toggleVoiceRecording();
    }
  }

  function toggleVoiceRecording() {
    if (isRecording) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsRecording(false);
      return;
    }

    const rec = createSpeechRecognizer(
      ({ final, interim }) => {
        if (final) {
          setTranscript((prev) => (prev ? `${prev} ${final}` : final));
        }
      },
      (err) => {
        console.error('Speech error:', err);
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );

    if (!rec) {
      alert('Speech recognition is not available in this browser. Please use Chrome or Edge, or type manually.');
      return;
    }

    recognizerRef.current = rec;
    rec.start();
    setIsRecording(true);
  }

  async function handleSubmitTurn() {
    if (!transcript.trim() || loading) return;
    const userSpoken = transcript.trim();
    setTranscript('');
    setLoading(true);

    try {
      const res = await api.simulateSpeaking(selectedMode, topic, userSpoken, language, turnCount);
      setSessionTurns((prev) => [
        ...prev,
        {
          turn: turnCount,
          userText: userSpoken,
          speaker: res.speaker,
          feedback: res.feedback,
          nextPrompt: res.next_prompt,
          grammar: res.grammar_analysis,
          score: res.score
        }
      ]);
      setTurnCount((c) => c + 1);

      // Auto speak next prompt for realistic spoken practice
      speakText(`${res.speaker} says: ${res.next_prompt}`);
    } catch (err) {
      console.error('Speaking simulation error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ========================================================================= */}
      {/* FEATURE HERO: 100% FREE AI ENGLISH SPEAKING PRACTICE */}
      {/* ========================================================================= */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(79, 70, 229, 0.08))',
        border: '1.5px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        boxShadow: '0 8px 30px rgba(37, 99, 235, 0.08)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                <Sparkles size={14} /> 100% Free • Unlimited Practice
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                AI Speaking Coach
              </span>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '8px' }}>
              Real-Time AI English Speaking Studio
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Many speaking apps ask for expensive monthly subscriptions. Here, practice real-world spoken English with an interactive AI coach for free. Speak with confidence, practice realistic interview questions, and receive spoken audio replies instantly.
            </p>

            <button
              onClick={handleStartSpeakingClick}
              className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isRecording ? 'Recording Active (Click to Stop)' : 'Start Speaking Practice Now'}</span>
              {!isRecording && <ArrowRight size={16} />}
            </button>
          </div>

          {/* AI and Human Practicing Image Showcase */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            border: '2px solid rgba(255,255,255,0.2)',
            position: 'relative',
            maxHeight: '260px'
          }}>
            <img
              src="/ai_human_speaking.jpg"
              alt="Human Learner and AI Speaking Partner Practicing English"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              fontSize: '0.74rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>🎙️ Voice Speech Recognition</span>
              <span>Audio Feedback Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Choose a Speaking Scenario</h3>
        <div className="grid-4">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;

            return (
              <div
                key={m.id}
                onClick={() => handleSelectMode(m)}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={20} color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <strong style={{ fontSize: '0.92rem' }}>{m.label}</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Scenario Setup */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Scenario Topic:
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>{topic}</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-primary">Turn {turnCount}</span>
          <span className="badge badge-success">{level.toUpperCase()}</span>
        </div>
      </div>

      {/* Past Turns Conversation Stream */}
      {sessionTurns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessionTurns.map((turn, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Round {turn.turn} Evaluation
                </span>
                <span className="badge badge-success">Fluency Score: {turn.score} / 100</span>
              </div>

              {/* What user said */}
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>You said:</strong> "{turn.userText}"
              </div>

              {/* Coach Feedback */}
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Coach Feedback:</strong> {turn.feedback}
              </div>

              {/* Next Prompt */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {turn.speaker} asks:
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    "{turn.nextPrompt}"
                  </div>
                </div>
                <button
                  onClick={() => speakText(turn.nextPrompt)}
                  className="btn btn-secondary btn-sm"
                  title="Listen to pronunciation"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spoken Turn Input */}
      <div ref={inputSectionRef} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Your Spoken Response</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {isRecording ? '🔴 Microphone recording active' : 'Click the mic button or type your response'}
          </span>
        </div>

        <textarea
          rows={4}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? 'Listening... Speak clearly into your microphone.' : 'Click "Speak into Mic" to start speaking, or type your sentence here...'}
          style={{ width: '100%', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
            style={{ fontWeight: 700 }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isRecording ? 'Stop Recording' : 'Speak into Mic'}</span>
          </button>

          <button
            onClick={handleSubmitTurn}
            disabled={loading || !transcript.trim()}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            {loading ? 'Evaluating Speech...' : 'Submit Spoken Turn'}
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
