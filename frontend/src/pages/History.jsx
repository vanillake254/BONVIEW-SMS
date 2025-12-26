import React, { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthProvider';

function fmtDate(value) {
  if (!value) return '';
  const d = value.toDate ? value.toDate() : new Date(value);
  return d.toLocaleString();
}

export default function History() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const when = fmtDate(l.createdAt).toLowerCase();
      const mode = String(l.mode || '').toLowerCase();
      const status = String(l.status || '').toLowerCase();
      const msg = String(l.message || '').toLowerCase();
      const recipients = String(l.recipientCount ?? '').toLowerCase();
      return (
        when.includes(q) ||
        mode.includes(q) ||
        status.includes(q) ||
        msg.includes(q) ||
        recipients.includes(q)
      );
    });
  }, [logs, search]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/logs', { token });
      setLogs(data.logs || []);
    } catch (e) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Message History</div>
        <button className="button secondary" type="button" onClick={load}>
          Refresh
        </button>
      </div>

      <Alert type="error">{error}</Alert>

      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <label className="label">Search</label>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by message, status, mode, date..."
        />
      </div>

      {loading ? (
        <div className="alert">Loading…</div>
      ) : filteredLogs.length === 0 ? (
        <div className="alert">No message logs yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Mode</th>
                <th>Recipients</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(l.createdAt)}</td>
                  <td>
                    <span className="badge">{l.mode}</span>
                  </td>
                  <td>{l.recipientCount}</td>
                  <td>
                    <span className="badge">{l.status}</span>
                  </td>
                  <td style={{ maxWidth: 520, whiteSpace: 'pre-wrap' }}>{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
