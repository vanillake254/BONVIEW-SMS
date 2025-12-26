import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../auth/AuthProvider';
import { apiFetch } from '../api';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuth();

  const [pendingLoginRedirect, setPendingLoginRedirect] = useState(false);

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  useEffect(() => {
    if (!pendingLoginRedirect) return;
    if (token && user) {
      navigate('/');
    }
  }, [pendingLoginRedirect, token, user, navigate]);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 900, margin: '48px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div className="appBrand" style={{ justifyContent: 'center' }}>
            <div className="appBrandLogo" aria-hidden="true" />
            <div className="appBrandText">
              <div className="appBrandTitle">Bonview Church</div>
              <div className="appBrandSub">Bulk Messaging</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Admin Login</div>
        <div style={{ color: 'var(--muted)', marginBottom: 16 }}>Manage members and send bulk SMS notifications.</div>

        <div className="row" style={{ alignItems: 'stretch' }}>
          <div className="card" style={{ flex: '1 1 380px' }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Admin Login</div>
            <Alert type="error">{error}</Alert>

            <div style={{ marginTop: 12 }}>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Password</label>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>

            <div style={{ marginTop: 16 }} className="row">
              <button
                className="button"
                type="button"
                disabled={busy}
                onClick={async () => {
                  setError('');
                  setBusy(true);
                  try {
                    await login(email.trim(), password);
                    setPendingLoginRedirect(true);
                  } catch (e) {
                    setError('Login failed. Please check your email and password.');
                    setPendingLoginRedirect(false);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>

            <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>
              For security, only admins can access the dashboard.
            </div>
          </div>

          <div className="card" style={{ flex: '1 1 380px' }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Subscribe for Church Notifications</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
              Enter your details to receive SMS notifications from Bonview Church.
            </div>

            <Alert type="error">{regError}</Alert>
            <Alert type="success">{regSuccess}</Alert>

            <div style={{ marginTop: 12 }}>
              <label className="label">Name</label>
              <input className="input" value={regName} onChange={(e) => setRegName(e.target.value)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Phone</label>
              <input className="input" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>

            <div style={{ marginTop: 16 }} className="row">
              <button
                className="button secondary"
                type="button"
                disabled={regBusy}
                onClick={async () => {
                  setRegError('');
                  setRegSuccess('');
                  setRegBusy(true);
                  try {
                    const resp = await apiFetch('/public/register', {
                      method: 'POST',
                      body: { name: regName.trim(), phone: regPhone.trim() },
                    });
                    setRegName('');
                    setRegPhone('');

                    if (resp.existed) {
                      setRegSuccess('You are already subscribed. Thank you!');
                    } else {
                      setRegSuccess('You are subscribed. Thank you!');
                    }
                  } catch (e) {
                    setRegError(e.message || 'Registration failed');
                  } finally {
                    setRegBusy(false);
                  }
                }}
              >
                {regBusy ? 'Saving…' : 'Subscribe'}
              </button>
            </div>

            <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>
              Reply STOP at any time to unsubscribe.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <a
            className="brandLink"
            href="https://vanillasoftwares.web.app"
            target="_blank"
            rel="noreferrer"
          >
            Powered by Vanilla Softwares
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
