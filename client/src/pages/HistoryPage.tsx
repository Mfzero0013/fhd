import React, { useState, useEffect } from 'react';
import { feedbacksAPI, usersAPI, sectorsAPI } from '../services/api';
import { Search, Filter, Eye, Trash2 } from 'lucide-react';

interface Feedback {
  id: number;
  titulo: string;
  tipo_feedback: 'positivo' | 'negativo' | 'neutro';
  descricao: string;
  nota: number;
  status: 'pendente' | 'aberto';
  criado_em: string;
  remetente_nome?: string;
  destinatario_nome?: string;
  setor_nome?: string;
  visualizado_em?: string;
}

export const HistoryPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [search, filterTipo, filterSetor, filterUsuario, filterStatus, currentPage]);

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

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbacksAPI.getReceived({ 
        page: currentPage,
        limit: 20,
        tipo: filterTipo,
        status: filterStatus
      });
      
      setFeedbacks(response.data.feedbacks || response.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await feedbacksAPI.markAsRead(id);
      loadFeedbacks();
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este feedback?')) {
      try {
        await feedbacksAPI.delete(id);
        loadFeedbacks();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao deletar feedback');
      }
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return '#10B981';
      case 'negativo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterTipo('');
    setFilterSetor('');
    setFilterUsuario('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  if (loading) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Histórico de Feedbacks</h2>
          <button className="btn" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 12, marginBottom: 16 }}>
          <div>
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todos os tipos</option>
            <option value="positivo">Positivo</option>
            <option value="negativo">Negativo</option>
            <option value="neutro">Neutro</option>
          </select>
          <select
            value={filterSetor}
            onChange={(e) => setFilterSetor(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todos os setores</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.nome}>{sector.nome}</option>
            ))}
          </select>
          <select
            value={filterUsuario}
            onChange={(e) => setFilterUsuario(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todos os usuários</option>
            {users.map(user => (
              <option key={user.id} value={user.nome}>{user.nome}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todos os status</option>
            <option value="nao_lido">Não lidos</option>
            <option value="lido">Lidos</option>
          </select>
          <button className="btn" onClick={loadFeedbacks}>
            <Filter size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {feedbacks.map(feedback => (
            <div key={feedback.id} className="card" style={{ 
              border: feedback.visualizado_em ? '1px solid #374151' : '2px solid #3B82F6',
              background: feedback.visualizado_em ? '#111827' : '#1E3A8A'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0' }}>{feedback.titulo}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: '14px', color: '#9CA3AF' }}>
                    <span>De: {feedback.remetente_nome}</span>
                    <span>Para: {feedback.destinatario_nome}</span>
                    <span>Setor: {feedback.setor_nome}</span>
                    <span>Nota: {feedback.nota}/10</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: getTipoColor(feedback.tipo_feedback),
                    color: 'white'
                  }}>
                    {feedback.tipo_feedback}
                  </span>
                  {!feedback.visualizado_em && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: '#3B82F6',
                      color: 'white'
                    }}>
                      Não lido
                    </span>
                  )}
                </div>
              </div>
              
              <p style={{ margin: '8px 0', color: '#D1D5DB' }}>{feedback.descricao}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {new Date(feedback.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {feedback.visualizado_em && (
                    <span style={{ marginLeft: 12 }}>
                      • Lido em: {new Date(feedback.visualizado_em).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!feedback.visualizado_em && (
                    <button
                      className="btn"
                      onClick={() => handleMarkAsRead(feedback.id)}
                      style={{ padding: '6px' }}
                    >
                      <Eye size={14} /> Marcar como lido
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleDelete(feedback.id)}
                    style={{ padding: '6px', background: '#DC2626', borderColor: '#DC2626' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {feedbacks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
              Nenhum feedback encontrado
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button
              className="btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 16px',
              color: '#9CA3AF'
            }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
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
  fontFamily: 'inherit'
};