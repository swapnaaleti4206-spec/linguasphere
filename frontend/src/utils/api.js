// API Client Helper for LinguaSphere AI

// Default production Render backend fallback
const PRODUCTION_BACKEND_URL = 'https://linguasphere-ba3h.onrender.com/api';

export function getApiBase() {
  const custom = localStorage.getItem('custom_backend_url');
  if (custom && custom.trim()) {
    let u = custom.trim().replace(/\/+$/, '');
    if (!u.endsWith('/api')) u = `${u}/api`;
    return u;
  }
  let envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl && envUrl.trim()) {
    let u = envUrl.trim().replace(/\/+$/, '');
    if (!u.endsWith('/api')) u = `${u}/api`;
    return u;
  }
  // If running on Vercel production, automatically point to your live Render backend!
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return PRODUCTION_BACKEND_URL;
  }
  return '/api';
}

export function setCustomBackendUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('custom_backend_url');
  } else {
    let clean = url.trim().replace(/\/+$/, '');
    localStorage.setItem('custom_backend_url', clean);
  }
}

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
  const apiBase = getApiBase();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const targetUrl = `${apiBase}${endpoint}`;

  let response;
  try {
    response = await fetch(targetUrl, config);
  } catch (netErr) {
    throw new Error(
      `Cannot connect to backend server at ${apiBase}. Please check your backend link or connection.`
    );
  }

  if (response.status === 401) {
    clearStoredAuth();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('attachment')) {
    return response.blob();
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text();
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Backend route not found at ${targetUrl}. Make sure your Render backend URL is configured correctly.`
        );
      }
      throw new Error(`Server returned error (${response.status}): ${text.slice(0, 100)}`);
    }
  }

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

  // Learning (Multilingual)
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
