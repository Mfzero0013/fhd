<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { exportAPI, usersAPI, sectorsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Download, Calendar, Users, FileText } from 'lucide-react';

export const ExportPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    setor_id: '',
    usuario_id: '',
    tipo_feedback: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, sectorsRes] = await Promise.all([
        usersAPI.getAll({ page: 1, limit: 1000 }),
        sectorsAPI.getAll({ ativo: 'true' })
      ]);
      
      setUsers(usersRes.data.users || []);
      setSectors(sectorsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleExport = async (type: 'feedbacks' | 'users') => {
    try {
      setLoading(true);
      
      let response;
      if (type === 'feedbacks') {
        if (user?.tipo === 'admin') {
          response = await exportAPI.exportFeedbacksAdmin(filters);
        } else {
          response = await exportAPI.exportFeedbacksManager(filters);
        }
      } else {
        response = await exportAPI.exportUsers(filters);
      }

      // Criar URL para download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = type === 'feedbacks' 
        ? `feedbacks_${new Date().toISOString().split('T')[0]}.csv`
        : `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    setFilters(prev => ({
      ...prev,
      dataInicio: startDate.toISOString().split('T')[0],
      dataFim: endDate.toISOString().split('T')[0]
    }));
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Exportar Relatórios CSV</h2>
        <p style={{ color: '#9CA3AF', marginBottom: 24 }}>
          Exporte dados do sistema em formato CSV para análise externa
        </p>

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Filtros */}
          <div className="card" style={{ background: '#1F2937' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} /> Filtros de Data
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label>Data Início</label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Data Fim</label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className="btn" onClick={() => setDateRange(7)}>Últimos 7 dias</button>
              <button className="btn" onClick={() => setDateRange(30)}>Últimos 30 dias</button>
              <button className="btn" onClick={() => setDateRange(90)}>Últimos 90 dias</button>
              <button className="btn" onClick={() => setFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }))}>
                Limpar datas
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label>Setor</label>
                <select
                  value={filters.setor_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, setor_id: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os setores</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Usuário</label>
                <select
                  value={filters.usuario_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, usuario_id: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os usuários</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Tipo de Feedback</label>
                <select
                  value={filters.tipo_feedback}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo_feedback: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os tipos</option>
                  <option value="positivo">Positivo</option>
                  <option value="negativo">Negativo</option>
                  <option value="neutro">Neutro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opções de Exportação */}
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: '#0A2342',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 24
              }}>
                📊
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Feedbacks</h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                {user?.tipo === 'admin' 
                  ? 'Todos os feedbacks do sistema' 
                  : 'Feedbacks da sua equipe'
                }
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => handleExport('feedbacks')}
                disabled={loading}
                style={{ width: '100%' }}
              >
                <Download size={18} /> 
                {loading ? 'Exportando...' : 'Exportar Feedbacks'}
              </button>
            </div>

            {user?.tipo === 'admin' && (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: '#7D695E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24
                }}>
                  👥
                </div>
                <h3 style={{ margin: '0 0 8px 0' }}>Usuários</h3>
                <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                  Lista completa de usuários do sistema
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleExport('users')}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  <Users size={18} /> 
                  {loading ? 'Exportando...' : 'Exportar Usuários'}
                </button>
              </div>
            )}

            <div className="card" style={{ textAlign: 'center', background: '#1F2937' }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 24
              }}>
                📋
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Informações</h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                Os arquivos CSV incluem todos os dados relevantes para análise
              </p>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                <div>• Formato: CSV</div>
                <div>• Codificação: UTF-8</div>
                <div>• Separador: Vírgula</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB',
  marginTop: 6,
  fontFamily: 'inherit'
=======
import React, { useState, useEffect } from 'react';
import { exportAPI, usersAPI, sectorsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Download, Calendar, Users, FileText } from 'lucide-react';

export const ExportPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    setor_id: '',
    usuario_id: '',
    tipo_feedback: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, sectorsRes] = await Promise.all([
        usersAPI.getAll({ page: 1, limit: 1000 }),
        sectorsAPI.getAll({ ativo: 'true' })
      ]);
      
      setUsers(usersRes.data.users || []);
      setSectors(sectorsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleExport = async (type: 'feedbacks' | 'users') => {
    try {
      setLoading(true);
      
      let response;
      if (type === 'feedbacks') {
        if (user?.tipo === 'admin') {
          response = await exportAPI.exportFeedbacksAdmin(filters);
        } else {
          response = await exportAPI.exportFeedbacksManager(filters);
        }
      } else {
        response = await exportAPI.exportUsers(filters);
      }

      // Criar URL para download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = type === 'feedbacks' 
        ? `feedbacks_${new Date().toISOString().split('T')[0]}.csv`
        : `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    setFilters(prev => ({
      ...prev,
      dataInicio: startDate.toISOString().split('T')[0],
      dataFim: endDate.toISOString().split('T')[0]
    }));
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Exportar Relatórios CSV</h2>
        <p style={{ color: '#9CA3AF', marginBottom: 24 }}>
          Exporte dados do sistema em formato CSV para análise externa
        </p>

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Filtros */}
          <div className="card" style={{ background: '#1F2937' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} /> Filtros de Data
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label>Data Início</label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label>Data Fim</label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className="btn" onClick={() => setDateRange(7)}>Últimos 7 dias</button>
              <button className="btn" onClick={() => setDateRange(30)}>Últimos 30 dias</button>
              <button className="btn" onClick={() => setDateRange(90)}>Últimos 90 dias</button>
              <button className="btn" onClick={() => setFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }))}>
                Limpar datas
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label>Setor</label>
                <select
                  value={filters.setor_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, setor_id: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os setores</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Usuário</label>
                <select
                  value={filters.usuario_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, usuario_id: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os usuários</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Tipo de Feedback</label>
                <select
                  value={filters.tipo_feedback}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo_feedback: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Todos os tipos</option>
                  <option value="positivo">Positivo</option>
                  <option value="negativo">Negativo</option>
                  <option value="neutro">Neutro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opções de Exportação */}
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: '#0A2342',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 24
              }}>
                📊
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Feedbacks</h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                {user?.tipo === 'admin' 
                  ? 'Todos os feedbacks do sistema' 
                  : 'Feedbacks da sua equipe'
                }
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => handleExport('feedbacks')}
                disabled={loading}
                style={{ width: '100%' }}
              >
                <Download size={18} /> 
                {loading ? 'Exportando...' : 'Exportar Feedbacks'}
              </button>
            </div>

            {user?.tipo === 'admin' && (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: '#7D695E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24
                }}>
                  👥
                </div>
                <h3 style={{ margin: '0 0 8px 0' }}>Usuários</h3>
                <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                  Lista completa de usuários do sistema
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleExport('users')}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  <Users size={18} /> 
                  {loading ? 'Exportando...' : 'Exportar Usuários'}
                </button>
              </div>
            )}

            <div className="card" style={{ textAlign: 'center', background: '#1F2937' }}>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 24
              }}>
                📋
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Informações</h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 16px 0', fontSize: 14 }}>
                Os arquivos CSV incluem todos os dados relevantes para análise
              </p>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                <div>• Formato: CSV</div>
                <div>• Codificação: UTF-8</div>
                <div>• Separador: Vírgula</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB',
  marginTop: 6,
  fontFamily: 'inherit'
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
};