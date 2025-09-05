import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './main.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { DashboardManager } from './pages/DashboardManager';
import { DashboardEmployee } from './pages/DashboardEmployee';
import { FeedbackPage } from './pages/FeedbackPage';
import { UsersPage } from './pages/UsersPage';
import { SectorsPositionsPage } from './pages/SectorsPositionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { UnreadPage } from './pages/UnreadPage';
import { ExportPage } from './pages/ExportPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const getDashboardComponent = () => {
    switch (user?.tipo) {
      case 'admin':
        return <DashboardAdmin />;
      case 'gestor':
        return <DashboardManager />;
      default:
        return <DashboardEmployee />;
    }
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={getDashboardComponent()} />
        <Route path="/feedback" element={<FeedbackPage />} />
        {user?.tipo === 'admin' && (
          <>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/catalog" element={<SectorsPositionsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </>
        )}
        {(user?.tipo === 'gestor' || user?.tipo === 'colaborador') && (
          <Route path="/unread" element={<UnreadPage />} />
        )}
        {(user?.tipo === 'admin' || user?.tipo === 'gestor') && (
          <Route path="/export" element={<ExportPage />} />
        )}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

