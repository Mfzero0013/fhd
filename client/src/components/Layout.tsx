import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, ClipboardList, FileDown, Inbox, MessageSquarePlus, Layers, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
      { to: '/feedback', icon: <MessageSquarePlus size={18} />, label: 'Feedback' },
    ];

    if (user?.tipo === 'admin') {
      return [
        ...baseItems,
        { to: '/users', icon: <Users size={18} />, label: 'Usuários' },
        { to: '/catalog', icon: <Layers size={18} />, label: 'Setores & Cargos' },
        { to: '/history', icon: <ClipboardList size={18} />, label: 'Histórico' },
        { to: '/export', icon: <FileDown size={18} />, label: 'Exportar CSV' },
      ];
    }

    if (user?.tipo === 'gestor') {
      return [
        ...baseItems,
        { to: '/unread', icon: <Inbox size={18} />, label: 'Não lidos' },
        { to: '/export', icon: <FileDown size={18} />, label: 'Exportar CSV' },
      ];
    }

    return [
      ...baseItems,
      { to: '/unread', icon: <Inbox size={18} />, label: 'Não lidos' },
    ];
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#0A2342', color: 'white', padding: 16, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Feedback360</div>
        
        <nav style={{ display: 'grid', gap: 8, flex: 1 }}>
          {getNavItems().map(item => (
            <NavLink 
              key={item.to}
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              active={location.pathname.startsWith(item.to)} 
            />
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '8px 12px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: 8, 
            marginBottom: 16 
          }}>
            <User size={16} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.nome}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{user?.tipo}</div>
            </div>
          </div>
          <button className="btn" style={{ width: '100%' }} onClick={logout}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
      color: 'white', textDecoration: 'none', borderRadius: 8,
      background: active ? 'rgba(255,255,255,0.12)' : 'transparent'
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};


