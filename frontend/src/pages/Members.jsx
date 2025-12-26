import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import Alert from '../components/Alert';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthProvider';

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data || []),
      error: reject,
    });
  });
}

export default function Members() {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [rowBusyId, setRowBusyId] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribedCount = useMemo(
    () => members.filter((m) => m.status === 'subscribed').length,
    [members]
  );

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = String(m.name || '').toLowerCase();
      const phone = String(m.phoneE164 || '').toLowerCase();
      const status = String(m.status || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || status.includes(q);
    });
  }, [members, search]);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/members', { token });
      setMembers(data.members || []);
    } catch (e) {
      setError(e.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="row">
      <div className="card" style={{ flex: '1 1 360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Members</div>
          <div className="badge">Subscribed: {subscribedCount}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
        </div>

        <div style={{ marginTop: 12 }} className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Add member</div>
          <div className="row">
            <div style={{ flex: '1 1 180px' }}>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={async () => {
                setError('');
                setSuccess('');
                setBusy(true);
                try {
                  await apiFetch('/members', {
                    method: 'POST',
                    token,
                    body: { name: name.trim(), phone: phone.trim() },
                  });
                  setName('');
                  setPhone('');
                  setSuccess('Member added.');
                  await refresh();
                } catch (e) {
                  setError(e.message || 'Failed to add member');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add
            </button>
          </div>
          <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>
            Uploads and manual adds assume members are opt-in and will be marked subscribed.
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Upload CSV</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
            CSV headers supported: name, phone (phone, phone number, mobile are also accepted)
          </div>
          <input
            className="input"
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setError('');
              setSuccess('');
              setBusy(true);
              try {
                const rows = await parseCsv(file);
                const items = rows
                  .map((r) => {
                    const nameValue = (r.name || r.Name || '').toString().trim();
                    const phoneValue = (r.phone || r.Phone || r.mobile || r.Mobile || r['phone number'] || r['Phone Number'] || '')
                      .toString()
                      .trim();
                    if (!nameValue || !phoneValue) return null;
                    return { name: nameValue, phone: phoneValue };
                  })
                  .filter(Boolean);

                if (items.length === 0) {
                  throw new Error('No valid rows found in CSV');
                }

                const resp = await apiFetch('/members/bulk', {
                  method: 'POST',
                  token,
                  body: { members: items },
                });

                setSuccess(
                  `Import complete. Created: ${resp.createdCount}. Invalid: ${resp.invalidCount}. Duplicates skipped: ${resp.duplicateCount}.`
                );
                await refresh();
              } catch (err) {
                setError(err.message || 'CSV import failed');
              } finally {
                setBusy(false);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="card" style={{ flex: '2 1 520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Current members</div>
          <button className="button secondary" type="button" onClick={refresh} disabled={busy}>
            Refresh
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label className="label">Search</label>
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or status..."
          />
        </div>

        {loading ? (
          <div className="alert">Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone (E.164)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.phoneE164}</td>
                    <td>
                      <span className="badge">{m.status}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <button
                          className="button secondary"
                          type="button"
                          disabled={busy || rowBusyId === m.id}
                          onClick={async () => {
                            const nextStatus = m.status === 'subscribed' ? 'suspended' : 'subscribed';
                            const label = nextStatus === 'suspended' ? 'suspend' : 'unsuspend';
                            if (!window.confirm(`Are you sure you want to ${label} ${m.name}?`)) return;
                            setError('');
                            setSuccess('');
                            setRowBusyId(m.id);
                            try {
                              const resp = await apiFetch(`/members/${m.id}/status`, {
                                method: 'PATCH',
                                token,
                                body: { status: nextStatus },
                              });
                              setMembers((prev) => prev.map((x) => (x.id === m.id ? resp.member : x)));
                              setSuccess(`Member ${label}ed.`);
                            } catch (e) {
                              setError(e.message || 'Failed to update member');
                            } finally {
                              setRowBusyId(null);
                            }
                          }}
                        >
                          {m.status === 'subscribed' ? 'Suspend' : 'Unsuspend'}
                        </button>

                        <button
                          className="button danger"
                          type="button"
                          disabled={busy || rowBusyId === m.id}
                          onClick={async () => {
                            if (!window.confirm(`Delete ${m.name}? This cannot be undone.`)) return;
                            setError('');
                            setSuccess('');
                            setRowBusyId(m.id);
                            try {
                              await apiFetch(`/members/${m.id}`, { method: 'DELETE', token });
                              setMembers((prev) => prev.filter((x) => x.id !== m.id));
                              setSuccess('Member deleted.');
                            } catch (e) {
                              setError(e.message || 'Failed to delete member');
                            } finally {
                              setRowBusyId(null);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
