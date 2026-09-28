import React, { useState, useEffect } from 'react';
import { getStoredUser, clearStoredAuth, api } from './utils/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TutorChat from './pages/TutorChat';
import GrammarLab from './pages/GrammarLab';
import VocabBuilder from './pages/VocabBuilder';
import TeluguQuiz from './pages/TeluguQuiz';
import DailyPractice from './pages/DailyPractice';
import SpeakingPractice from './pages/SpeakingPractice';
import WritingAssistants from './pages/WritingAssistants';
import ReadingComprehension from './pages/ReadingComprehension';
import WritingEvaluation from './pages/WritingEvaluation';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedLevel, setSelectedLevel] = useState(user?.level || 'intermediate');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [streak, setStreak] = useState(0); // Starts at 0 real-time
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load real user streak from database
  useEffect(() => {
    if (user) {
      api.getDashboardStats()
        .then((stats) => {
          if (stats && typeof stats.streak_days === 'number') {
            setStreak(stats.streak_days);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
    setSelectedLevel(userData.level || 'intermediate');
    setCurrentTab('dashboard');
  }

  function handleLogout() {
    clearStoredAuth();
    setUser(null);
    setStreak(0);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isAdmin={user.role === 'admin'}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          user={user}
          streak={streak}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />

        <main style={{ flex: 1, paddingBottom: '40px' }}>
          {currentTab === 'dashboard' && (
            <Dashboard user={user} onNavigateTab={setCurrentTab} language={selectedLanguage} />
          )}
          {currentTab === 'chat' && (
            <TutorChat user={user} level={selectedLevel} language={selectedLanguage} />
          )}
          {currentTab === 'grammar' && (
            <GrammarLab language={selectedLanguage} />
          )}
          {currentTab === 'vocab' && (
            <VocabBuilder level={selectedLevel} language={selectedLanguage} />
          )}
          {currentTab === 'telugu' && (
            <TeluguQuiz language={selectedLanguage} onStreakUpdated={setStreak} />
          )}
          {currentTab === 'daily' && (
            <DailyPractice level={selectedLevel} language={selectedLanguage} />
          )}
          {currentTab === 'speaking' && (
            <SpeakingPractice user={user} level={selectedLevel} language={selectedLanguage} />
          )}
          {currentTab === 'writing' && (
            <WritingAssistants language={selectedLanguage} />
          )}
          {currentTab === 'reading' && (
            <ReadingComprehension level={selectedLevel} language={selectedLanguage} />
          )}
          {currentTab === 'evaluation' && (
            <WritingEvaluation language={selectedLanguage} />
          )}
          {currentTab === 'admin' && user.role === 'admin' && (
            <AdminPanel user={user} />
          )}
        </main>
      </div>
    </div>
  );
}
