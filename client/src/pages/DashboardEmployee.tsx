<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  mediaEquipe: number;
  totalFeedbacks: number;
  meusFeedbacks: Array<{
    id: number;
    titulo: string;
    tipo_feedback: string;
    nota: number;
    criado_em: string;
    remetente_nome: string;
    visualizado_em?: string;
  }>;
  feedbacksNaoLidos: number;
}

export const DashboardEmployee: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getEmployee();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando dashboard...</div>;
  }

  if (!data) {
    return <div>Erro ao carregar dados do dashboard</div>;
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return '#10B981';
      case 'negativo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Média da Equipe</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#10B981' }}>
            {data.mediaEquipe.toFixed(1)}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            {data.totalFeedbacks} feedbacks
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Meus Feedbacks</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B82F6' }}>
            {data.meusFeedbacks.length}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            recebidos
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Não Lidos</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: data.feedbacksNaoLidos > 0 ? '#F59E0B' : '#9CA3AF' }}>
            {data.feedbacksNaoLidos}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            pendentes
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Seus Feedbacks Recentes</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {data.meusFeedbacks.length > 0 ? (
            data.meusFeedbacks.map((feedback, index) => (
              <div key={feedback.id} style={{ 
                padding: '16px 0',
                borderBottom: index < data.meusFeedbacks.length - 1 ? '1px solid #374151' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    marginBottom: 8 
                  }}>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{feedback.titulo}</h4>
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
                        Novo
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>
                    De: {feedback.remetente_nome}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {new Date(feedback.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 16 }}>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 700,
                    color: feedback.nota >= 7 ? '#10B981' : feedback.nota >= 5 ? '#F59E0B' : '#EF4444'
                  }}>
                    {feedback.nota}/10
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    nota
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9CA3AF', 
              padding: '40px',
              fontSize: 16
            }}>
              Você ainda não recebeu nenhum feedback
            </div>
          )}
        </div>
      </div>

      {data.feedbacksNaoLidos > 0 && (
        <div className="card" style={{ 
          marginTop: 24, 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
          border: '1px solid #3B82F6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700
            }}>
              {data.feedbacksNaoLidos}
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>
                Você tem {data.feedbacksNaoLidos} feedback{data.feedbacksNaoLidos > 1 ? 's' : ''} não lido{data.feedbacksNaoLidos > 1 ? 's' : ''}
              </h4>
              <p style={{ margin: 0, color: '#93C5FD', fontSize: 14 }}>
                Acesse a aba "Não lidos" para visualizar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


=======
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  mediaEquipe: number;
  totalFeedbacks: number;
  meusFeedbacks: Array<{
    id: number;
    titulo: string;
    tipo_feedback: string;
    nota: number;
    criado_em: string;
    remetente_nome: string;
    visualizado_em?: string;
  }>;
  feedbacksNaoLidos: number;
}

export const DashboardEmployee: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getEmployee();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando dashboard...</div>;
  }

  if (!data) {
    return <div>Erro ao carregar dados do dashboard</div>;
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return '#10B981';
      case 'negativo': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Média da Equipe</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#10B981' }}>
            {data.mediaEquipe.toFixed(1)}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            {data.totalFeedbacks} feedbacks
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Meus Feedbacks</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B82F6' }}>
            {data.meusFeedbacks.length}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            recebidos
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Não Lidos</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: data.feedbacksNaoLidos > 0 ? '#F59E0B' : '#9CA3AF' }}>
            {data.feedbacksNaoLidos}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            pendentes
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Seus Feedbacks Recentes</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {data.meusFeedbacks.length > 0 ? (
            data.meusFeedbacks.map((feedback, index) => (
              <div key={feedback.id} style={{ 
                padding: '16px 0',
                borderBottom: index < data.meusFeedbacks.length - 1 ? '1px solid #374151' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    marginBottom: 8 
                  }}>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{feedback.titulo}</h4>
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
                        Novo
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>
                    De: {feedback.remetente_nome}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {new Date(feedback.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 16 }}>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 700,
                    color: feedback.nota >= 7 ? '#10B981' : feedback.nota >= 5 ? '#F59E0B' : '#EF4444'
                  }}>
                    {feedback.nota}/10
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    nota
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9CA3AF', 
              padding: '40px',
              fontSize: 16
            }}>
              Você ainda não recebeu nenhum feedback
            </div>
          )}
        </div>
      </div>

      {data.feedbacksNaoLidos > 0 && (
        <div className="card" style={{ 
          marginTop: 24, 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
          border: '1px solid #3B82F6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700
            }}>
              {data.feedbacksNaoLidos}
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'white' }}>
                Você tem {data.feedbacksNaoLidos} feedback{data.feedbacksNaoLidos > 1 ? 's' : ''} não lido{data.feedbacksNaoLidos > 1 ? 's' : ''}
              </h4>
              <p style={{ margin: 0, color: '#93C5FD', fontSize: 14 }}>
                Acesse a aba "Não lidos" para visualizar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
