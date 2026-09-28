import React from 'react';
import { Flame, Globe2, Moon, Sun, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({
  user,
  streak = 3,
  theme,
  onToggleTheme,
  onLogout,
  selectedLevel,
  onSelectLevel,
  selectedLanguage,
  onSelectLanguage
}) {
  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Identity: LinguaSphere AI */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold'
        }}>
          <Globe2 size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            LinguaSphere <span style={{ color: 'var(--primary)', fontWeight: 700 }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>English • Deutsch • 한국어</p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            style={{
              padding: '4px 10px',
              fontSize: '0.84rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-text)',
              border: '1px solid #bfdbfe'
            }}
          >
            <option value="english">🇺🇸 English</option>
            <option value="german">🇩🇪 Deutsch (German)</option>
            <option value="korean">🇰🇷 한국어 (Korean)</option>
          </select>
        </div>

        {/* Level Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => onSelectLevel(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <option value="beginner">Beginner (A1-A2)</option>
            <option value="intermediate">Intermediate (B1-B2)</option>
            <option value="advanced">Advanced (C1-C2)</option>
          </select>
        </div>

        {/* Streak Counter */}
        <div className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '6px 10px' }} title="Learning Streak">
          <Flame size={15} fill="currentColor" />
          <span>{streak}d</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile Pill */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 6px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: user.role === 'admin' ? '#7c3aed' : 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{user.name || user.email}</span>
              <span style={{ fontSize: '0.68rem', color: user.role === 'admin' ? '#7c3aed' : 'var(--text-muted)', fontWeight: 600 }}>
                {user.role === 'admin' ? 'Primary Admin' : 'Authorized Learner'}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                marginLeft: '6px',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
