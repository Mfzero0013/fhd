import React, { useState, useEffect } from 'react';
import { feedbacksAPI, usersAPI, sectorsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Eye, Trash2, Filter } from 'lucide-react';

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

interface User {
  id: number;
  nome: string;
  email: string;
}

interface Sector {
  id: number;
  nome: string;
}

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    destinatario_id: '',
    setor_id: '',
    titulo: '',
    tipo_feedback: 'positivo' as 'positivo' | 'negativo' | 'neutro',
    descricao: '',
    nota: 5,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbacksRes, usersRes, sectorsRes] = await Promise.all([
        activeTab === 'received' 
          ? feedbacksAPI.getReceived({ tipo: filterTipo, status: filterStatus })
          : feedbacksAPI.getSent({ tipo: filterTipo }),
        usersAPI.getForFeedback(),
        sectorsAPI.getAll({ ativo: 'true' })
      ]);
      
      setFeedbacks(feedbacksRes.data.feedbacks || feedbacksRes.data);
      setUsers(usersRes.data);
      setSectors(sectorsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterTipo, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbacksAPI.create(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar feedback');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await feedbacksAPI.markAsRead(id);
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este feedback?')) {
      try {
        await feedbacksAPI.delete(id);
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao deletar feedback');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      destinatario_id: '',
      setor_id: '',
      titulo: '',
      tipo_feedback: 'positivo',
      descricao: '',
      nota: 5,
    });
  };

  const openNewFeedback = () => {
    resetForm();
    setShowModal(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return '#10B981';
      case 'negativo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Feedbacks</h2>
          <button className="btn btn-primary" onClick={openNewFeedback}>
            <Plus size={18} /> Criar Feedback
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`btn ${activeTab === 'received' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Recebidos ({feedbacks.length})
          </button>
          <button
            className={`btn ${activeTab === 'sent' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Enviados ({feedbacks.length})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 16 }}>
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
          
          {activeTab === 'received' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos os status</option>
              <option value="nao_lido">Não lidos</option>
              <option value="lido">Lidos</option>
            </select>
          )}
          
          <button className="btn" onClick={loadData}>
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
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{feedback.titulo}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: '14px', color: '#9CA3AF' }}>
                    <span>
                      {activeTab === 'received' ? 'De:' : 'Para:'} {activeTab === 'received' ? feedback.remetente_nome : feedback.destinatario_nome}
                    </span>
                    <span>Setor: {feedback.setor_nome}</span>
                    <span>Nota: {feedback.nota}/10</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: getTipoColor(feedback.tipo_feedback),
                    color: 'white'
                  }}>
                    {feedback.tipo_feedback}
                  </span>
                  {!feedback.visualizado_em && activeTab === 'received' && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: '#3B82F6',
                      color: 'white'
                    }}>
                      Novo
                    </span>
                  )}
                </div>
              </div>
              
              <p style={{ margin: '8px 0', color: '#D1D5DB' }}>{feedback.descricao}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {new Date(feedback.criado_em).toLocaleDateString('pt-BR')}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {activeTab === 'received' && !feedback.visualizado_em && (
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
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Criar Feedback</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label>Destinatário *</label>
                <select
                  value={formData.destinatario_id}
                  onChange={(e) => setFormData({...formData, destinatario_id: e.target.value})}
                  required
                  style={inputStyle}
                >
                  <option value="">Selecione um destinatário</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.nome} ({user.email})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Setor *</label>
                <select
                  value={formData.setor_id}
                  onChange={(e) => setFormData({...formData, setor_id: e.target.value})}
                  required
                  style={inputStyle}
                >
                  <option value="">Selecione um setor</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label>Tipo de Feedback *</label>
                <select
                  value={formData.tipo_feedback}
                  onChange={(e) => setFormData({...formData, tipo_feedback: e.target.value as any})}
                  required
                  style={inputStyle}
                >
                  <option value="positivo">Positivo</option>
                  <option value="negativo">Negativo</option>
                  <option value="neutro">Neutro</option>
                </select>
              </div>
              
              <div>
                <label>Nota (0-10) *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.nota}
                  onChange={(e) => setFormData({...formData, nota: parseInt(e.target.value)})}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label>Descrição *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                  rows={4}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">
                  Criar Feedback
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
};