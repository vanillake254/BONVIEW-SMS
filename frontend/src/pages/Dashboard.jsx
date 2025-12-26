import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Dashboard</div>
      <div style={{ color: 'var(--muted)' }}>
        Use Members to manage opt-in contacts, Send Message for bulk SMS/WhatsApp, and Message History to review delivery.
      </div>

      <div style={{ marginTop: 12 }} className="row">
        <button className="button" type="button" onClick={() => navigate('/send')}>
          Quick Send Message
        </button>
      </div>
      <div style={{ marginTop: 14 }} className="alert">
        Sending is restricted to 6:00 AM – 10:00 PM (US time, configured on the server). SMS automatically includes “Reply STOP to unsubscribe.”
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <a
          className="brandLink"
          href="https://vanillasoftwares.web.app"
          target="_blank"
          rel="noreferrer"
        >
          Proudly made by Vanilla Softwares
        </a>
      </div>
    </div>
  );
}
