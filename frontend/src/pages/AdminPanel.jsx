import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Download,
  FileSpreadsheet,
  Settings,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminPanel({ user }) {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMaxUsers, setNewMaxUsers] = useState(2);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserLevel, setNewUserLevel] = useState('intermediate');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [cfgData, statsData] = await Promise.all([
        api.getAdminConfig(),
        api.getActivityStats()
      ]);
      setConfig(cfgData);
      setStats(statsData);
      setNewMaxUsers(cfgData.max_allowed_users || 2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load admin configuration.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateMaxUsers() {
    setMessage('');
    setErrorMessage('');
    try {
      const res = await api.updateMaxUsers(Number(newMaxUsers));
      setMessage(`Successfully updated allowed users limit to ${res.max_allowed_users}.`);
      loadAdminData();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    try {
      await api.addAuthorizedUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        level: newUserLevel
      });
      setMessage(`User ${newUserEmail} authorized successfully!`);
      setShowAddModal(false);
      setNewUserEmail('');
      setNewUserName('');
      loadAdminData();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  async function handleRemoveUser(targetEmail) {
    if (!confirm(`Are you sure you want to revoke access for ${targetEmail}?`)) return;
    setMessage('');
    setErrorMessage('');
    try {
      await api.removeAuthorizedUser(targetEmail);
      setMessage(`Revoked authorization for ${targetEmail}.`);
      loadAdminData();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  async function handleExportJson() {
    try {
      const blob = await api.exportDataBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english_ai_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export data: ' + err.message);
    }
  }

  async function handleDownloadReport() {
    try {
      const blob = await api.downloadReportBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english_ai_learning_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (err) {
      alert('Failed to download report: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator controls...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <ShieldCheck size={24} color="#7c3aed" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Administration & Access Controls</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Manage authorized learner whitelist, configure user quotas, track platform-wide activity, and export backups.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-light)', color: 'var(--success)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUTHORIZED SLOTS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
            {config?.allowed_users?.length || 0} / {config?.max_allowed_users || 2}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configured in allowed_users.json</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI CHAT MESSAGES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
            {stats?.total_chat_messages || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across all learner sessions</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>SPEAKING TURNS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
            {stats?.total_speaking_sessions || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interview & speech sessions</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAVED VOCABULARY</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
            {stats?.total_saved_vocabulary || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Learner lexicon items</div>
        </div>
      </div>

      {/* Quota Management & Data Exports */}
      <div className="grid-2">
        {/* Maximum Users Limit Control */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>Maximum Allowed Users Quota</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Adjust how many private learners can be authorized on this instance without code modifications.
          </p>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              min={1}
              max={50}
              value={newMaxUsers}
              onChange={(e) => setNewMaxUsers(e.target.value)}
              style={{ width: '100px', fontWeight: 700 }}
            />
            <button onClick={handleUpdateMaxUsers} className="btn btn-secondary btn-sm">
              Save New Limit
            </button>
          </div>
        </div>

        {/* Data Backup & Reporting */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>Export Data & Reports</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Download complete SQLite database backups or generate formatted CSV learner progress summaries.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportJson} className="btn btn-secondary btn-sm">
              <Download size={14} />
              <span>Export Full JSON Data</span>
            </button>
            <button onClick={handleDownloadReport} className="btn btn-secondary btn-sm">
              <FileSpreadsheet size={14} />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authorized Users Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Authorized Whitelist Roster</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Only emails in this whitelist are permitted to log in.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={config?.allowed_users?.length >= config?.max_allowed_users}
            className="btn btn-primary btn-sm"
          >
            <UserPlus size={15} />
            <span>Add Authorized Learner</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>Learner Name</th>
                <th style={{ padding: '10px 14px' }}>Authorized Email</th>
                <th style={{ padding: '10px 14px' }}>Role</th>
                <th style={{ padding: '10px 14px' }}>CEFR Level</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {config?.allowed_users?.map((u) => {
                const isCurrentAdmin = u.email.toLowerCase() === user?.email?.toLowerCase();

                return (
                  <tr key={u.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textTransform: 'capitalize' }}>{u.level}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {!isCurrentAdmin ? (
                        <button
                          onClick={() => handleRemoveUser(u.email)}
                          style={{ color: 'var(--danger)', padding: '6px' }}
                          title="Revoke access"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Current User</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Authorize New Learner</h3>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. David Chen"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. david.chen@example.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="user">Learner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Level</label>
                  <select
                    value={newUserLevel}
                    onChange={(e) => setNewUserLevel(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Authorize User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
