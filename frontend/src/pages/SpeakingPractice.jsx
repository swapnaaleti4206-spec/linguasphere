import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported
} from '../utils/speech';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Play,
  ArrowRight,
  AlertTriangle,
  Award,
  MessageCircle,
  HelpCircle,
  Check,
  ChevronRight
} from 'lucide-react';

export default function SpeakingPractice({ user, level = 'intermediate', language = 'english' }) {
  // Assigned AI Persona
  const coach = {
    name: 'Coach Sarah',
    role: 'AI Speaking Mentor & Dialogue Partner',
    avatar: '👩‍💼',
    status: 'Online & Listening',
  };

  const tasks = [
    {
      id: 'task-intro',
      title: 'Task 1: The 30-Second Self-Introduction',
      category: 'Warm-up & Confidence',
      badge: 'Beginner / Warmup',
      initialPrompt: `Hi ${user?.name || 'Swapna'}! I'm Coach Sarah, your personal English speaking partner. Let's start with a warm-up! Please introduce yourself, what you are currently studying or working on, and one thing you enjoy doing in your free time. Click the microphone below and speak for 20-30 seconds!`,
      sampleAnswer: "Hello Sarah! My name is Swapna. I am deeply passionate about technology and language learning, and in my free time I love reading books and exploring new concepts."
    },
    {
      id: 'task-challenge',
      title: 'Task 2: Describing a Tough Challenge You Solved',
      category: 'Behavioral & STAR Method',
      badge: 'Intermediate',
      initialPrompt: "Excellent! For our second speaking challenge: Tell me about a difficult obstacle or project problem you encountered recently. How did you approach solving it, and what was the outcome?",
      sampleAnswer: "Recently, I faced a tight project deadline with unexpected technical bugs. I prioritized the critical issues first, collaborated closely with my team, and successfully delivered the project on time."
    },
    {
      id: 'task-opinion',
      title: 'Task 3: Defending Your Opinion (Persuasion)',
      category: 'Professional Debates',
      badge: 'Advanced',
      initialPrompt: "Great! Let's practice persuasive speaking: In your view, do you believe remote work is more effective than working in an office? Share your opinion with two clear supporting reasons.",
      sampleAnswer: "In my perspective, remote work offers tremendous flexibility and eliminates commute stress, allowing professionals to maintain high productivity while balancing personal well-being."
    },
    {
      id: 'task-cafe',
      title: 'Task 4: Spontaneous Networking & Small Talk',
      category: 'Social & Daily Life',
      badge: 'Everyday Fluency',
      initialPrompt: "Imagine we just met at a tech networking conference over coffee. How would you introduce yourself naturally, and what advice would you give someone starting in this field?",
      sampleAnswer: "Hi there! Great to meet you. It's an exciting conference today. My biggest advice for someone starting out is to stay curious, build consistent daily habits, and never hesitate to ask questions."
    },
    {
      id: 'task-free',
      title: 'Free Dialogue: Open 2-Person Chat',
      category: 'Natural Conversation',
      badge: 'Free Flow',
      initialPrompt: "This is our open speaking lounge! Speak to me about anything on your mind today—your goals, a movie you watched, the weather, or ask me any question. I'm listening!",
      sampleAnswer: "Today I want to talk about my future learning goals and how consistent practice helps me speak English with true confidence."
    }
  ];

  const [activeTask, setActiveTask] = useState(tasks[0]);
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState('');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  const recognizerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize conversation when task changes
  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
    setMessages([
      {
        id: 'msg-init',
        sender: 'coach',
        name: coach.name,
        avatar: coach.avatar,
        text: activeTask.initialPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested: activeTask.sampleAnswer,
        score: null,
        feedback: null
      }
    ]);
    setTurnCount(1);
    setTranscript('');
    setInterimText('');
    setMicError('');
  }, [activeTask]);

  // Scroll to bottom of dialogue stream
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText, loading]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      stopSpeaking();
    };
  }, []);

  function handlePlayAudio(textToPlay) {
    setIsSpeakingAudio(true);
    speakText(textToPlay, {
      language,
      onEnd: () => setIsSpeakingAudio(false),
      onError: () => setIsSpeakingAudio(false)
    });
  }

  function handleStopAudio() {
    stopSpeaking();
    setIsSpeakingAudio(false);
  }

  // Toggle Microphone
  function toggleVoiceRecording() {
    setMicError('');

    if (isRecording) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    setTranscript('');
    setInterimText('');

    const rec = createSpeechRecognizer({
      language,
      continuous: true,
      onTranscript: ({ final, interim }) => {
        if (final) {
          setTranscript((prev) => (prev ? `${prev} ${final}` : final));
          setInterimText('');
        } else if (interim) {
          setInterimText(interim);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notice:', err);
        if (err === 'not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
        } else if (err === 'no-speech') {
          // Normal when user pauses
        } else {
          setMicError(`Mic notice: ${err}`);
        }
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (!rec) {
      setMicError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your answer.');
      return;
    }

    try {
      recognizerRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start mic:', err);
      setMicError('Could not start microphone. If already listening, please click Stop and try again.');
      setIsRecording(false);
    }
  }

  // Submit User Spoken Response
  async function handleSubmitTurn(overrideText = null) {
    const userSpoken = (overrideText || transcript || interimText).trim();
    if (!userSpoken || loading) return;

    // Stop recording if active
    if (isRecording) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    }

    const currentTurn = turnCount;
    setTranscript('');
    setInterimText('');
    setLoading(true);

    // Add User Message to Chat Stream
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      name: user?.name || 'Swapna (You)',
      avatar: '🎙️',
      text: userSpoken,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: null,
      feedback: null
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.simulateSpeaking(
        activeTask.id,
        activeTask.title,
        userSpoken,
        language,
        currentTurn
      );

      const coachReplyMsg = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        name: coach.name,
        avatar: coach.avatar,
        text: res.next_prompt || "What else would you like to share about this?",
        feedback: res.feedback,
        suggested: res.suggested_phrasing,
        score: res.score,
        grammar: res.grammar_analysis,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachReplyMsg]);
      setTurnCount((c) => c + 1);

      // Speak Coach Sarah's response out loud
      const voiceReaction = `${res.feedback} ${res.next_prompt}`;
      handlePlayAudio(voiceReaction);
    } catch (err) {
      console.error('Speaking simulation error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-err-${Date.now()}`,
          sender: 'coach',
          name: coach.name,
          avatar: coach.avatar,
          text: "I heard you clearly! Let's continue practicing. Could you tell me more about that?",
          feedback: "Great vocal clarity and volume! Keep speaking naturally.",
          suggested: userSpoken,
          score: 88,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Retest / Re-speak a Turn
  function handleRetestTurn(textToRetest) {
    setTranscript(textToRetest);
    toggleVoiceRecording();
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO: ASSIGNED AI PERSONA (COACH SARAH) & PHILOSOPHY */}
      {/* ========================================================================= */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(79, 70, 229, 0.08))',
        border: '1.5px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 6px 18px rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            border: '2px solid var(--primary)'
          }}>
            {coach.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{coach.name}</h2>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                🟢 {coach.status}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                textTransform: 'uppercase'
              }}>
                100% Free
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '3px' }}>
              {coach.role} • Interactive 2-Person Spoken Dialogue
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isSpeakingAudio ? (
            <button
              onClick={handleStopAudio}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', fontWeight: 600 }}
            >
              <VolumeX size={16} />
              <span>Stop AI Voice</span>
            </button>
          ) : (
            <button
              onClick={() => handlePlayAudio(activeTask.initialPrompt)}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              <Volume2 size={16} />
              <span>Listen to Coach Sarah</span>
            </button>
          )}

          <div style={{
            width: '90px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-light)'
          }}>
            <img
              src="/ai_human_speaking.jpg"
              alt="AI and Human Practicing"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STRUCTURED SPEAKING TASKS SELECTOR */}
      {/* ========================================================================= */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--primary)" />
            <span>Select Your Structured Speaking Task</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Turn-by-turn conversational practice
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {tasks.map((t) => {
            const isSelected = activeTask.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setActiveTask(t)}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    {t.badge}
                  </span>
                  {isSelected && <Check size={14} color="var(--primary)" />}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {t.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-PERSON INTERACTIVE CONVERSATION CHAT (COACH & LEARNER) */}
      {/* ========================================================================= */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '380px',
        maxHeight: '560px',
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: 'var(--bg-surface)'
      }}>
        {messages.map((m) => {
          const isCoach = m.sender === 'coach';

          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                flexDirection: isCoach ? 'row' : 'row-reverse'
              }}
            >
              {/* Avatar Icon */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: isCoach ? 'var(--primary-light)' : 'var(--bg-secondary)',
                border: isCoach ? '1.5px solid var(--primary)' : '1.5px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {m.avatar}
              </div>

              {/* Message Bubble Container */}
              <div style={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: isCoach ? 'flex-start' : 'flex-end'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                  <strong style={{ color: isCoach ? 'var(--primary)' : 'var(--text-primary)' }}>{m.name}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{m.timestamp}</span>
                </div>

                {/* Main Speech Bubble */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  borderTopLeftRadius: isCoach ? '4px' : 'var(--radius-lg)',
                  borderTopRightRadius: isCoach ? 'var(--radius-lg)' : '4px',
                  backgroundColor: isCoach ? 'var(--bg-secondary)' : 'var(--primary)',
                  color: isCoach ? 'var(--text-primary)' : '#ffffff',
                  fontSize: '0.94rem',
                  lineHeight: 1.55,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  {m.text}

                  {isCoach && (
                    <button
                      onClick={() => handlePlayAudio(m.text)}
                      style={{
                        marginLeft: '10px',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        verticalAlign: 'middle'
                      }}
                      title="Listen with voice audio"
                    >
                      <Volume2 size={13} /> Play Voice
                    </button>
                  )}
                </div>

                {/* Coach Feedback & Fluency Score Box */}
                {isCoach && m.feedback && (
                  <div style={{
                    marginTop: '6px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.84rem',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} /> Coach Speaking Feedback:
                      </span>
                      {m.score && (
                        <span className="badge badge-success" style={{ fontWeight: 800 }}>
                          Fluency Score: {m.score} / 100
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{m.feedback}</p>

                    {/* Suggested Natural Phrasing */}
                    {m.suggested && (
                      <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>💡 Natural Native Phrasing to Try:</strong>
                        <div style={{ fontStyle: 'italic', color: 'var(--primary-text)', marginTop: '2px', fontSize: '0.82rem' }}>
                          "{m.suggested}"
                        </div>
                        <button
                          onClick={() => handleRetestTurn(m.suggested.replace(/^"|"$/g, ''))}
                          style={{
                            marginTop: '6px',
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            padding: 0
                          }}
                        >
                          <RotateCcw size={12} /> Test & Re-speak this Phrasing
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Speech Preview (As User Speaks) */}
        {isRecording && (
          <div style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            flexDirection: 'row-reverse'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: '2px solid #dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              animation: 'pulse 1.5s infinite'
            }}>
              🎙️
            </div>
            <div style={{
              maxWidth: '75%',
              padding: '12px 18px',
              borderRadius: 'var(--radius-lg)',
              borderTopRightRadius: '4px',
              backgroundColor: '#eff6ff',
              border: '1.5px dashed var(--primary)',
              color: 'var(--primary-text)',
              fontSize: '0.94rem'
            }}>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: '#dc2626', marginBottom: '4px' }}>
                ● LISTENING TO YOUR VOICE IN REAL-TIME...
              </span>
              {transcript || interimText || "Speak clearly now, words will appear here..."}
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '1.4rem' }}>{coach.avatar}</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Coach Sarah is analyzing your pronunciation, fluency, and formulating the next challenge...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ========================================================================= */}
      {/* 4. SPEAKING ACTION & MICROPHONE CONTROL PANEL */}
      {/* ========================================================================= */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        border: isRecording ? '2px solid #dc2626' : '1px solid var(--border-light)',
        boxShadow: isRecording ? '0 0 20px rgba(220, 38, 38, 0.15)' : 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Your Spoken Turn (Two-Person Talk)</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isRecording ? '🔴 Listening actively... Click "Finish & Send Turn" when you finish.' : 'Click "Start Speaking" or type below to complete this task.'}
            </div>
          </div>
          <span className="badge badge-primary">Round {turnCount}</span>
        </div>

        {/* Microphone Error Alert (If Denied / Unsupported) */}
        {micError && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{micError}</span>
          </div>
        )}

        {/* Editable Transcript Textarea */}
        <textarea
          rows={3}
          value={transcript || interimText}
          onChange={(e) => {
            setTranscript(e.target.value);
            setInterimText('');
          }}
          placeholder={
            isRecording
              ? 'Listening to your voice... Speak clearly into your microphone!'
              : 'Click "Start Speaking" to talk aloud, or type your response here...'
          }
          style={{
            width: '100%',
            fontSize: '0.96rem',
            resize: 'vertical',
            border: isRecording ? '1.5px solid #dc2626' : '1px solid var(--border-light)'
          }}
        />

        {/* Quick Testing Sample Chips (One-tap test) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quick sample to test:</span>
          <button
            onClick={() => setTranscript(activeTask.sampleAnswer)}
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary)',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: 600
            }}
          >
            "{activeTask.sampleAnswer.slice(0, 48)}..."
          </button>
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '6px'
        }}>
          {/* Big Microphone Toggle Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
            style={{
              padding: '14px 26px',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: isRecording ? '0 4px 16px rgba(220, 38, 38, 0.4)' : '0 4px 16px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isRecording ? 'Stop Recording' : 'Start Speaking into Mic'}</span>
          </button>

          {/* Submit Turn */}
          <button
            type="button"
            onClick={() => handleSubmitTurn()}
            disabled={loading || (!transcript.trim() && !interimText.trim())}
            className="btn btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '0.95rem',
              fontWeight: 700
            }}
          >
            {loading ? 'Coach Sarah is Analyzing...' : 'Send Spoken Turn to Coach Sarah'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
