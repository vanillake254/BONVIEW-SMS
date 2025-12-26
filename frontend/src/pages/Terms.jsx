import React from 'react';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 980, margin: '32px auto' }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Terms and Conditions</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Effective date: {new Date().toLocaleDateString()}
        </div>

        <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 12 }}>
            This website and dashboard (the “Service”) is provided by Bonview Church to manage opt-in contacts and send bulk
            SMS notifications. By using the Service, you agree to these Terms.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>1) Eligibility and access</div>
          <div>
            The dashboard is intended for authorized church administrators. You must keep admin credentials confidential and
            notify us if you suspect unauthorized access.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>2) Acceptable use</div>
          <div>
            You agree not to use the Service to send unlawful, abusive, deceptive, or spam content. Messages must be
            church-related and comply with applicable U.S. laws and carrier policies.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>3) SMS compliance and opt-out</div>
          <div>
            Recipients may opt out by replying STOP (or similar keywords). Opt-out requests are honored by marking the number
            as unsubscribed/suspended. Do not re-add opted-out numbers without documented consent.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>4) Your responsibilities (consent)</div>
          <div>
            You are responsible for ensuring you have appropriate consent to contact recipients and for maintaining accurate
            records. U.S. regulations may include the TCPA and related guidance.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>5) Service availability</div>
          <div>
            The Service is provided “as is” and may be modified or interrupted. We are not liable for delays or message
            delivery issues caused by carriers, providers, or third parties.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>6) Limitation of liability</div>
          <div>
            To the fullest extent permitted by law, Bonview Church will not be liable for indirect or consequential damages
            arising from use of the Service.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>7) Changes</div>
          <div>
            We may update these Terms at any time. Continued use after changes means you accept the updated Terms.
          </div>

          <div style={{ fontWeight: 800, marginTop: 14, marginBottom: 6 }}>8) Contact</div>
          <div>
            For questions about these Terms, contact Bonview Church administration.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
