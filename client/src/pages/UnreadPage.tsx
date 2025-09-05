<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { feedbacksAPI } from '../services/api';
import { Eye, Trash2, Filter } from 'lucide-react';

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

export const UnreadPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, [filterTipo]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbacksAPI.getReceived({ 
        status: 'nao_lido',
        tipo: filterTipo 
      });
      setFeedbacks(response.data.feedbacks || response.data);
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

  if (loading) {
    return <div>Carregando feedbacks não lidos...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Feedbacks Não Lidos</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            <button className="btn" onClick={loadFeedbacks}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#9CA3AF'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ margin: '0 0 8px 0' }}>Nenhum feedback não lido</h3>
            <p style={{ margin: 0 }}>Você está em dia com todos os seus feedbacks!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {feedbacks.map(feedback => (
              <div key={feedback.id} className="card" style={{ 
                border: '2px solid #3B82F6',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#3B82F6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  NOVO
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'white' }}>{feedback.titulo}</h4>
                    <div style={{ display: 'flex', gap: 12, fontSize: '14px', color: '#93C5FD', marginBottom: 8 }}>
                      <span>De: {feedback.remetente_nome}</span>
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
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 12 
                }}>
                  <p style={{ margin: 0, color: '#E5E7EB' }}>{feedback.descricao}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#93C5FD' }}>
                    {new Date(feedback.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn"
                      onClick={() => handleMarkAsRead(feedback.id)}
                      style={{ 
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white'
                      }}
                    >
                      <Eye size={14} /> Marcar como lido
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDelete(feedback.id)}
                      style={{ 
                        padding: '8px 16px',
                        background: '#DC2626',
                        border: '1px solid #DC2626',
                        color: 'white'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB',
  fontFamily: 'inherit'
=======
import React, { useState, useEffect } from 'react';
import { feedbacksAPI } from '../services/api';
import { Eye, Trash2, Filter } from 'lucide-react';

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

export const UnreadPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, [filterTipo]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbacksAPI.getReceived({ 
        status: 'nao_lido',
        tipo: filterTipo 
      });
      setFeedbacks(response.data.feedbacks || response.data);
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

  if (loading) {
    return <div>Carregando feedbacks não lidos...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Feedbacks Não Lidos</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            <button className="btn" onClick={loadFeedbacks}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#9CA3AF'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ margin: '0 0 8px 0' }}>Nenhum feedback não lido</h3>
            <p style={{ margin: 0 }}>Você está em dia com todos os seus feedbacks!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {feedbacks.map(feedback => (
              <div key={feedback.id} className="card" style={{ 
                border: '2px solid #3B82F6',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#3B82F6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  NOVO
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, marginRight: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'white' }}>{feedback.titulo}</h4>
                    <div style={{ display: 'flex', gap: 12, fontSize: '14px', color: '#93C5FD', marginBottom: 8 }}>
                      <span>De: {feedback.remetente_nome}</span>
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
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 12 
                }}>
                  <p style={{ margin: 0, color: '#E5E7EB' }}>{feedback.descricao}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#93C5FD' }}>
                    {new Date(feedback.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn"
                      onClick={() => handleMarkAsRead(feedback.id)}
                      style={{ 
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white'
                      }}
                    >
                      <Eye size={14} /> Marcar como lido
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDelete(feedback.id)}
                      style={{ 
                        padding: '8px 16px',
                        background: '#DC2626',
                        border: '1px solid #DC2626',
                        color: 'white'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#0B1220',
  color: '#E5E7EB',
  fontFamily: 'inherit'
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
};