<<<<<<< HEAD
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Feedback360</h2>
        <p style={{ color: '#9CA3AF', marginBottom: 24 }}>Sistema de Gestão de Feedbacks</p>
        
        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#DC2626', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>Email
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              required 
              style={inputStyle}
              disabled={loading}
            />
          </label>
          <label>Senha
            <input 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              type="password" 
              required 
              style={inputStyle}
              disabled={loading}
            />
          </label>
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button className="btn" type="button" disabled={loading}>
            Esqueci minha senha
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: '#1F2937', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Conta de Teste:</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
            Email: admin@empresa.com<br />
            Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB'
};


=======
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Feedback360</h2>
        <p style={{ color: '#9CA3AF', marginBottom: 24 }}>Sistema de Gestão de Feedbacks</p>
        
        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#DC2626', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>Email
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              required 
              style={inputStyle}
              disabled={loading}
            />
          </label>
          <label>Senha
            <input 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              type="password" 
              required 
              style={inputStyle}
              disabled={loading}
            />
          </label>
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button className="btn" type="button" disabled={loading}>
            Esqueci minha senha
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: '#1F2937', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Conta de Teste:</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
            Email: admin@empresa.com<br />
            Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB'
};


>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
