// Browser Web Speech API Utility for Multilingual Speaking & Audio Coaching (English, German, Korean)

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean('speechSynthesis' in window);
}

export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const clean = text.replace(/[*_#`]/g, '').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);

    const langCodeMap = {
      english: 'en-US',
      german: 'de-DE',
      korean: 'ko-KR'
    };

    const targetLang = options.language ? (langCodeMap[options.language.toLowerCase()] || 'en-US') : (options.lang || 'en-US');
    utterance.lang = targetLang;
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prefer English/German/Korean female/natural tutor voice if available
    const matchingVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      const fallbackVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));
      if (fallbackVoice) utterance.voice = fallbackVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Robust polymorphic Speech Recognizer:
 * Can be called with:
 * 1) createSpeechRecognizer({ language, onTranscript, onError, onEnd, continuous })
 * 2) createSpeechRecognizer(onTranscript, onError, onEnd)
 * 3) createSpeechRecognizer(language, onTranscript, onError, onEnd)
 */
export function createSpeechRecognizer(arg1 = 'english', arg2, arg3, arg4) {
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (!SpeechRecognition) {
    console.warn('Web Speech Recognition API is not supported in this browser.');
    return null;
  }

  let language = 'english';
  let onTranscript = null;
  let onError = null;
  let onEnd = null;
  let continuous = true;

  if (typeof arg1 === 'object' && arg1 !== null) {
    language = arg1.language || 'english';
    onTranscript = arg1.onTranscript;
    onError = arg1.onError;
    onEnd = arg1.onEnd;
    if (arg1.continuous !== undefined) continuous = arg1.continuous;
  } else if (typeof arg1 === 'function') {
    onTranscript = arg1;
    onError = arg2;
    onEnd = arg3;
    language = 'english';
  } else {
    language = arg1 || 'english';
    onTranscript = arg2;
    onError = arg3;
    onEnd = arg4;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  const langCodeMap = {
    english: 'en-US',
    german: 'de-DE',
    korean: 'ko-KR'
  };
  recognition.lang = langCodeMap[language.toLowerCase()] || 'en-US';

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const trans = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += trans;
      } else {
        interim += trans;
      }
    }

    if (onTranscript) {
      onTranscript({ final: final.trim(), interim: interim.trim() });
    }
  };

  recognition.onerror = (event) => {
    console.error('[SpeechRecognizer] Error event:', event.error, event.message);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
