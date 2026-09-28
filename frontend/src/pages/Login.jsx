import React, { useState, useEffect } from 'react';
import { api, setStoredAuth } from '../utils/api';
import { Globe2, Shield, Lock, AlertCircle, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('swapnaaleti4206@gmail.com');
  const [passcode, setPasscode] = useState('swapp@123');
  const [configPreview, setConfigPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const data = await api.getConfigPreview();
      setConfigPreview(data);
      if (data?.default_passcode) {
        setPasscode(data.default_passcode);
      }
    } catch (err) {
      console.error('Failed to load login config:', err);
    }
  }

  async function handleLogin(targetEmail = email, targetPasscode = passcode) {
    setError('');
    setLoading(true);

    try {
      const res = await api.login(targetEmail, targetPasscode);
      setStoredAuth(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleTestUnauthorized() {
    setEmail('guest@unauthorized.com');
    handleLogin('guest@unauthorized.com', 'swapp@123');
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
        maxWidth: '520px',
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

        {/* Access Status Card */}
        <div className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Private Access Control</span>
            </div>
            <span className="badge badge-primary">
              {configPreview ? `${configPreview.total_authorized} / ${configPreview.max_allowed_users} Authorized Slots` : '2 Allowed Users'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Administrator: <strong>Swapna Aleti</strong> (Full Control). Only authorized email addresses can log in.
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

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Authorized Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="swapnaaleti4206@gmail.com"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Access Passcode
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passcode: swapp@123</span>
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
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

          {/* Quick 1-Click Demo Logins for Authorized Users */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
              Authorized Quick Logins (Passcode: swapp@123)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setEmail('swapnaaleti4206@gmail.com');
                  setPasscode('swapp@123');
                  handleLogin('swapnaaleti4206@gmail.com', 'swapp@123');
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={16} color="#7c3aed" />
                  <span style={{ fontWeight: 700 }}>Swapna Aleti (Admin)</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>swapnaaleti4206@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('mounikasavitri371@gmail.com');
                  setPasscode('swapp@123');
                  handleLogin('mounikasavitri371@gmail.com', 'swapp@123');
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={16} color="var(--success)" />
                  <span style={{ fontWeight: 700 }}>Mounika Savitri (Learner)</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>mounikasavitri371@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={handleTestUnauthorized}
                style={{
                  padding: '8px',
                  fontSize: '0.76rem',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: 0.85
                }}
              >
                <Lock size={13} />
                <span>Test unauthorized email rejection (Access Control check)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
