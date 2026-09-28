import React, { useState, useEffect } from 'react';
import { api, setStoredAuth, getApiBase, setCustomBackendUrl } from '../utils/api';
import { Globe2, Shield, Lock, AlertCircle, ArrowRight, Settings } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('testing'); // 'connected', 'disconnected', 'testing'

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    setConnectionStatus('testing');
    try {
      await api.getConfigPreview();
      setConnectionStatus('connected');
      setError('');
    } catch (err) {
      setConnectionStatus('disconnected');
      setShowBackendConfig(true);
      setBackendUrlInput(getApiBase().replace(/\/api\/?$/, ''));
      setError(
        'Backend connection not found. If this is your first time on Vercel, please paste your Render backend URL below.'
      );
    }
  }

  function handleSaveBackendUrl(e) {
    e.preventDefault();
    if (!backendUrlInput.trim()) return;
    setCustomBackendUrl(backendUrlInput);
    testConnection();
  }

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email.trim() || !passcode.trim()) {
      setError('Please enter both your email address and passcode.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email.trim(), passcode.trim());
      setStoredAuth(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials or backend URL.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Globe2 size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            LinguaSphere <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '6px' }}>
            Private Multilingual Studio: <strong>English • German • Korean</strong>
          </p>
        </div>

        {/* Backend Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: connectionStatus === 'connected' ? 'var(--success-light)' : 'var(--warning-light)',
          fontSize: '0.8rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? 'var(--success)' : 'var(--warning)'
            }} />
            <span>
              Backend: {connectionStatus === 'connected' ? 'Connected & Ready' : 'Connecting / Needs URL'}
            </span>
          </div>

          <button
            onClick={() => setShowBackendConfig(!showBackendConfig)}
            style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Settings size={13} />
            <span>{showBackendConfig ? 'Hide' : 'Configure URL'}</span>
          </button>
        </div>

        {/* Optional Custom Backend URL Input Box */}
        {showBackendConfig && (
          <form onSubmit={handleSaveBackendUrl} className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Render Backend API URL:</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Paste your Render Web Service URL (e.g. <code style={{ fontFamily: 'var(--font-mono)' }}>https://linguasphere-ba3h.onrender.com</code>):
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={backendUrlInput}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                placeholder="https://your-service.onrender.com"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Connect
              </button>
            </div>
          </form>
        )}

        {/* Access Status Card */}
        <div className="card" style={{ padding: '14px 18px', backgroundColor: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Private Access Control</span>
            </div>
            <span className="badge badge-primary">Authorized Users Only</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Only pre-authorized team accounts can sign in. Unauthorized email addresses are strictly blocked.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Sign in to your Learning Studio</h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontSize: '0.86rem',
              marginBottom: '18px',
              lineHeight: 1.4
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} autoComplete="off">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Authorized Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Access Passcode
                </label>
              </div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your passcode"
                autoComplete="current-password"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.96rem' }}
            >
              {loading ? 'Authenticating...' : 'Enter LinguaSphere Studio'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
