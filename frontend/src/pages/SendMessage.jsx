import React, { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthProvider';

export default function SendMessage() {
  const { token } = useAuth();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [mode, setMode] = useState('sms');
  const [audience, setAudience] = useState('all');
  const [selected, setSelected] = useState(() => new Set());

  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [memberSearch, setMemberSearch] = useState('');

  const subscribedMembers = useMemo(
    () => members.filter((m) => m.status === 'subscribed'),
    [members]
  );

  const filteredSubscribedMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return subscribedMembers;
    return subscribedMembers.filter((m) => {
      const name = String(m.name || '').toLowerCase();
      const phone = String(m.phoneE164 || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [subscribedMembers, memberSearch]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  async function loadMembers() {
    setLoadingMembers(true);
    try {
      const data = await apiFetch('/members', { token });
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (mode === 'whatsapp' || mode === 'both') {
      setMode('sms');
      setError('WhatsApp sending is disabled for now. Please use SMS only.');
    }
  }, [mode]);

  return (
    <div className="row">
      <div className="card" style={{ flex: '1 1 420px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Send Message</div>

        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div style={{ marginTop: 12 }}>
          <label className="label">Channel</label>
          <select
            className="select"
            value={mode}
            onChange={(e) => {
              const next = e.target.value;
              if (next === 'whatsapp' || next === 'both') {
                setError('WhatsApp sending is disabled for now. Please use SMS only.');
                setMode('sms');
                return;
              }
              setMode(next);
            }}
          >
            <option value="sms">SMS only</option>
            <option value="whatsapp" disabled>
              WhatsApp only (disabled)
            </option>
            <option value="both" disabled>
              SMS + WhatsApp (disabled)
            </option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Recipients</label>
          <select
            className="select"
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value);
              setSelected(new Set());
            }}
          >
            <option value="all">All subscribed members</option>
            <option value="selected">Selected members</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Message</label>
          <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: 'var(--muted)', fontSize: 12 }}>
            <div>Characters: {message.length}</div>
            <div>{mode === 'sms' || mode === 'both' ? 'SMS adds opt-out line automatically.' : 'WhatsApp message is sent as written.'}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="alert">
          Please keep messages church-appropriate and avoid urgent or sales-like language.
        </div>

        <div style={{ marginTop: 10 }} className="badge">
          Sending window: 6:00 AM – 10:00 PM (US time)
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={async () => {
              setError('');
              setSuccess('');
              setBusy(true);
              try {
                const body = {
                  message: message.trim(),
                  mode,
                  recipients:
                    audience === 'all'
                      ? { type: 'all' }
                      : { type: 'selected', memberIds: selectedIds },
                };
                const resp = await apiFetch('/send-message', { method: 'POST', token, body });
                setSuccess(
                  `Sent. Recipients: ${resp.recipientCount}. SMS sent: ${resp.results?.sms?.sent || 0} (failed ${resp.results?.sms?.failed || 0}). WhatsApp sent: ${resp.results?.whatsapp?.sent || 0} (failed ${resp.results?.whatsapp?.failed || 0}).`
                );
                setMessage('');
                setSelected(new Set());
              } catch (e) {
                setError(e.message || 'Failed to send');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: '1 1 520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Subscribed members</div>
          <button className="button secondary" type="button" onClick={loadMembers} disabled={busy}>
            Refresh
          </button>
        </div>

        {loadingMembers ? (
          <div className="alert">Loading…</div>
        ) : filteredSubscribedMembers.length === 0 ? (
          <div className="alert">No subscribed members available.</div>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <label className="label">Search subscribed</label>
              <input
                className="input"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or phone..."
              />
            </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  {audience === 'selected' ? <th>Select</th> : null}
                  <th>Name</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribedMembers.map((m) => (
                  <tr key={m.id}>
                    {audience === 'selected' ? (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(m.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(m.id);
                            else next.delete(m.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                    ) : null}
                    <td>{m.name}</td>
                    <td>{m.phoneE164}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {audience === 'selected' ? (
          <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>
            Selected: {selected.size}
          </div>
        ) : null}
      </div>
    </div>
  );
}
