import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterLinks">
          <Link className="siteFooterLink" to="/terms">
            Terms
          </Link>
          <Link className="siteFooterLink" to="/privacy">
            Privacy
          </Link>
          <Link className="siteFooterLink" to="/cookies">
            Cookies
          </Link>
        </div>
        <div className="siteFooterMeta">© {new Date().getFullYear()} Bonview Church</div>
      </div>
    </div>
  );
}
