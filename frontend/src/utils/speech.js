// Browser Web Speech API Utility for Multilingual Pronunciation (English, German, Korean)

export function speakText(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();

  const clean = text.replace(/[*_#`]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(clean);

  // Map language to speech codes
  const langCodeMap = {
    english: 'en-US',
    german: 'de-DE',
    korean: 'ko-KR'
  };

  const targetLang = options.language ? (langCodeMap[options.language] || 'en-US') : (options.lang || 'en-US');
  utterance.lang = targetLang;
  utterance.rate = options.rate || 0.95;
  utterance.pitch = options.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognizer(language = 'english', onTranscript, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;

  const langCodeMap = {
    english: 'en-US',
    german: 'de-DE',
    korean: 'ko-KR'
  };
  recognition.lang = langCodeMap[language] || 'en-US';

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    onTranscript({ final, interim });
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
