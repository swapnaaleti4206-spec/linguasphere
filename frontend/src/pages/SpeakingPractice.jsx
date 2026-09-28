import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import { speakText, createSpeechRecognizer } from '../utils/speech';
import { Mic, MicOff, Volume2, Briefcase, Users, Megaphone, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SpeakingPractice({ user, level }) {
  const [selectedMode, setSelectedMode] = useState('interview');
  const [topic, setTopic] = useState('Behavioral Strengths & Problem Solving');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionTurns, setSessionTurns] = useState([]);

  const recognizerRef = useRef(null);

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
      const res = await api.simulateSpeaking(selectedMode, topic, userSpoken, turnCount);
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
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Spoken Simulation & Pronunciation Studio</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
          Practice high-stakes English scenarios with voice speech recognition, natural audio feedback, and structured rubrics.
        </p>
      </div>

      {/* Mode Selector Cards */}
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
                <span className="badge badge-success">Score: {turn.score} / 100</span>
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
                  title="Listen again"
                >
                  <Volume2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spoken Turn Input */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Your Spoken Response</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Use microphone or type to practice</span>
        </div>

        <textarea
          rows={4}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? 'Listening... Speak clearly into your microphone.' : 'Type your answer or click the microphone to speak...'}
          style={{ width: '100%', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{isRecording ? 'Stop Recording' : 'Speak into Mic'}</span>
          </button>

          <button
            onClick={handleSubmitTurn}
            disabled={loading || !transcript.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Evaluating Speech...' : 'Submit Spoken Turn'}
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
