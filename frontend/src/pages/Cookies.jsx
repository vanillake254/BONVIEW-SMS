import React from 'react';
import Footer from '../components/Footer';

export default function Cookies() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 980, margin: '32px auto' }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Cookie Policy</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Effective date: {new Date().toLocaleDateString()}
        </div>

        <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 12 }}>
            This Service uses limited local storage and similar technologies to provide core functionality.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>What we store</div>
          <div>
            - Authentication token for administrators (to keep you signed in)
            <br />- Last activity timestamp (to auto-logout inactive sessions)
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Why we store it</div>
          <div>
            This data is necessary for security and to operate the admin dashboard. We do not use this data for advertising.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Managing storage</div>
          <div>
            You can clear site data in your browser settings to remove stored tokens and activity data.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
