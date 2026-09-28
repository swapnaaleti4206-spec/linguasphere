// API Client Helper for LinguaSphere AI

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getStoredToken() {
  return localStorage.getItem('token') || '';
}

export function setStoredAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    clearStoredAuth();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('attachment')) {
    return response.blob();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getConfigPreview: () => request('/auth/config-preview'),
  login: (email, passcode = '') => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, passcode }),
  }),
  getMe: () => request('/auth/me'),

  // Learning (Multilingual: English, German, Korean)
  sendMessage: (sessionId, message, level = 'intermediate', language = 'english', englishOnly = true, mode = 'tutor') =>
    request('/learning/chat', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message, level, language, english_only: englishOnly, mode }),
    }),
  getChatHistory: (sessionId) => request(`/learning/chat/history?session_id=${encodeURIComponent(sessionId)}`),
  checkGrammar: (text, language = 'english') => request('/learning/grammar-check', {
    method: 'POST',
    body: JSON.stringify({ text, language, save_mistakes: true }),
  }),
  getVocabulary: (language = 'english', level = 'all') => request(`/learning/vocabulary?language=${language}&level=${level}`),
  saveWord: (wordData) => request('/learning/vocabulary/save', {
    method: 'POST',
    body: JSON.stringify(wordData),
  }),
  getDailyPractice: (language = 'english', level = 'intermediate') => request(`/learning/daily-practice?language=${language}&level=${level}`),
  getPronunciation: (word, language = 'english') => request(`/learning/pronunciation?word=${encodeURIComponent(word)}&language=${language}`),
  simulateSpeaking: (mode, topic, userTranscript, language = 'english', turnCount = 1) =>
    request('/learning/speaking-simulation', {
      method: 'POST',
      body: JSON.stringify({ mode, topic, user_transcript: userTranscript, language, turn_count: turnCount }),
    }),
  assistWriting: (taskType, userInput, tone = 'formal', language = 'english') =>
    request('/learning/writing-assist', {
      method: 'POST',
      body: JSON.stringify({ task_type: taskType, user_input: userInput, tone, language }),
    }),
  evaluateWriting: (text, prompt = '', taskType = 'essay', language = 'english') =>
    request('/learning/writing-evaluate', {
      method: 'POST',
      body: JSON.stringify({ text, prompt, task_type: taskType, language }),
    }),
  getReadingExercises: (level = 'intermediate') => request(`/learning/reading-exercises?level=${level}`),
  getRecommendations: () => request('/learning/recommendations'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getGrammarMistakes: (limit = 20) => request(`/dashboard/grammar-mistakes?limit=${limit}`),
  getActivityHistory: (limit = 10) => request(`/dashboard/activity-history?limit=${limit}`),

  // Admin
  getAdminConfig: () => request('/admin/config'),
  updateMaxUsers: (maxAllowedUsers) => request('/admin/update-max-users', {
    method: 'POST',
    body: JSON.stringify({ max_allowed_users: maxAllowedUsers }),
  }),
  addAuthorizedUser: (userData) => request('/admin/add-user', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  removeAuthorizedUser: (email) => request(`/admin/remove-user?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
  }),
  getActivityStats: () => request('/admin/activity-stats'),
  exportDataBlob: () => request('/admin/export-data'),
  downloadReportBlob: () => request('/admin/learning-report'),
};
