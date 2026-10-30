import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Phone, Clock, Target, BarChart3, Settings,
  LogOut, Bell, Wifi, WifiOff,
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getRelances } from '../api/relances.api';

const MENU = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/equipe',     label: 'Équipe',     icon: Users },
  { to: '/prospects',  label: 'Prospects',  icon: UserCheck },
  { to: '/activites',  label: 'Activités',  icon: Phone },
  { to: '/relances',   label: 'Relances',   icon: Clock },
  { to: '/objectifs',  label: 'Objectifs',  icon: Target },
  { to: '/rapports',   label: 'Rapports',   icon: BarChart3 },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
];

function useEnLigne() {
  const [enLigne, setEnLigne] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setEnLigne(true);
    const off = () => setEnLigne(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return enLigne;
}

export default function Layout({ user, onLogout }) {
  const enLigne = useEnLigne();
  const { pathname } = useLocation();

  // Relancé à chaque changement de page pour garder le badge à jour
  const { data } = useFetch(() => getRelances(), [pathname]);
  const retard = data?.compteurs?.retard ?? 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-logo">EC</span>
          <div>
            <div className="topbar-titre">
              <strong>Easy Call</strong>
              <span className="suite-badge">Easy Suite by Volkeno</span>
            </div>
            <small>Chaque appel compte • B2B Sénégal</small>
          </div>
        </div>

        <div className="topbar-actions">
          <span className={`statut ${enLigne ? 'on' : 'off'}`} role="status">
            {enLigne ? <Wifi size={14} /> : <WifiOff size={14} />}
            {enLigne ? 'En ligne' : 'Hors ligne'}
          </span>

          <Link
            to="/relances"
            className="cloche"
            aria-label={retard ? `${retard} relances en retard` : 'Relances'}
            title="Relances en retard"
          >
            <Bell size={18} />
            {retard > 0 && <span className="cloche-badge">{retard > 9 ? '9+' : retard}</span>}
          </Link>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-logo">EC</span>
            <div>
              <strong>Easy Call</strong>
              <small>{user.role === 'admin' ? 'Administration' : 'Manager & Direction'}</small>
            </div>
          </div>

          <nav className="menu">
            {MENU.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="charte">
              <strong>Charte déontologique</strong>
              <p>Easy Call valorise la régularité commerciale. Aucun enregistrement de conversation n'est collecté.</p>
            </div>
            <button className="logout" onClick={onLogout}>
              <LogOut size={16} /> <span>Se déconnecter</span>
            </button>
          </div>
        </aside>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}