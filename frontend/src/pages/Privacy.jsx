import React from 'react';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 980, margin: '32px auto' }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Privacy Policy</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Effective date: {new Date().toLocaleDateString()}
        </div>

        <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 12 }}>
            This policy describes how Bonview Church handles personal information collected through this Service.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Information we collect</div>
          <div>
            - Contact info submitted for notifications: name and phone number.
            <br />- Message logs: message content, delivery status, timestamps, and recipient counts.
            <br />- Opt-out events: inbound STOP messages and related metadata.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>How we use information</div>
          <div>
            We use information to:
            <br />- Manage opt-in subscription lists.
            <br />- Send church notifications via SMS.
            <br />- Maintain compliance records (opt-outs, delivery logs).
            <br />- Secure and operate the Service.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Sharing</div>
          <div>
            We do not sell personal information. We may share data with service providers (e.g., SMS delivery providers and
            hosting) solely to operate the Service.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Retention</div>
          <div>
            We retain subscriber data and message logs as needed for church operations, auditing, and compliance. We may delete
            or anonymize information when no longer needed.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Your choices</div>
          <div>
            - Opt out anytime by replying STOP.
            <br />- You may request updates or removal of your contact details by contacting Bonview Church.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Security</div>
          <div>
            We use reasonable administrative and technical safeguards to protect data. No method of transmission or storage is
            100% secure.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>Contact</div>
          <div>
            For privacy questions, contact Bonview Church administration.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
