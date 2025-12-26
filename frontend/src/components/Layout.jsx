import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import Footer from './Footer';

function Brand() {
  return (
    <div className="appBrand">
      <div className="appBrandLogo" aria-hidden="true" />
      <div className="appBrandText">
        <div className="appBrandTitle">Bonview Church</div>
        <div className="appBrandSub">Bulk Messaging</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems = (
    <>
      <NavLink
        className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
        to="/"
        onClick={() => setSidebarOpen(false)}
      >
        Dashboard
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
        to="/members"
        onClick={() => setSidebarOpen(false)}
      >
        Members
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
        to="/send"
        onClick={() => setSidebarOpen(false)}
      >
        Send Message
      </NavLink>
      <NavLink
        className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
        to="/history"
        onClick={() => setSidebarOpen(false)}
      >
        Message History
      </NavLink>
    </>
  );

  return (
    <div className="appShell">
      <div className={sidebarOpen ? 'sidebarOverlay open' : 'sidebarOverlay'} onClick={() => setSidebarOpen(false)} />

      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="sidebarHeader">
          <Brand />
        </div>

        <nav className="sidebarNav">{navItems}</nav>

        <div className="sidebarFooter">
          <div className="badge" style={{ marginBottom: 10 }}>
            Signed in as {user?.email || 'admin'}
          </div>
          <button
            className="button secondary"
            onClick={async () => {
              await logout();
              setSidebarOpen(false);
              navigate('/login');
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="iconButton" type="button" onClick={() => setSidebarOpen((v) => !v)}>
            <span className="hamburger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="srOnly">Menu</span>
          </button>
          <div className="topbarTitle">
            <Brand />
          </div>
          <div className="topbarRight" />
        </div>

        <div className="container">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
}
