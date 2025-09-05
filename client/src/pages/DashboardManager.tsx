<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  mediaEquipe: number;
  totalFeedbacks: number;
  membrosEquipe: Array<{
    id: number;
    nome: string;
    email: string;
    total_feedbacks: number;
    media_nota: number;
    feedbacks_nao_lidos: number;
  }>;
  feedbacksRecentes: Array<{
    id: number;
    titulo: string;
    tipo_feedback: string;
    nota: number;
    criado_em: string;
    remetente_nome: string;
    destinatario_nome: string;
  }>;
}

export const DashboardManager: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getManager();
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

  const chartData = data.membrosEquipe.map(member => ({
    name: member.nome.split(' ')[0], // Primeiro nome apenas
    total: member.total_feedbacks,
    media: member.media_nota
  }));

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
          <h3 style={{ marginTop: 0 }}>Membros da Equipe</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B82F6' }}>
            {data.membrosEquipe.length}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            colaboradores
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Feedbacks Não Lidos</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#F59E0B' }}>
            {data.membrosEquipe.reduce((acc, member) => acc + member.feedbacks_nao_lidos, 0)}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            pendentes
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginTop: 0 }}>Feedbacks por Colaborador</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" fill="#7D695E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Feedbacks Recentes</h3>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {data.feedbacksRecentes.map((feedback, index) => (
              <div key={feedback.id} style={{ 
                padding: '8px 0',
                borderBottom: index < data.feedbacksRecentes.length - 1 ? '1px solid #374151' : 'none'
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{feedback.titulo}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                  {feedback.remetente_nome} → {feedback.destinatario_nome}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Nota: {feedback.nota}/10 • {new Date(feedback.criado_em).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
            {data.feedbacksRecentes.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                Nenhum feedback recente
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Detalhes da Equipe</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Colaborador</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Total Feedbacks</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Média</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Não Lidos</th>
              </tr>
            </thead>
            <tbody>
              {data.membrosEquipe.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px 8px' }}>{member.nome}</td>
                  <td style={{ padding: '12px 8px' }}>{member.total_feedbacks}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ color: member.media_nota >= 7 ? '#10B981' : member.media_nota >= 5 ? '#F59E0B' : '#EF4444' }}>
                      {member.media_nota.toFixed(1)}/10
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      color: member.feedbacks_nao_lidos > 0 ? '#F59E0B' : '#9CA3AF',
                      fontWeight: member.feedbacks_nao_lidos > 0 ? 600 : 400
                    }}>
                      {member.feedbacks_nao_lidos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


=======
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  mediaEquipe: number;
  totalFeedbacks: number;
  membrosEquipe: Array<{
    id: number;
    nome: string;
    email: string;
    total_feedbacks: number;
    media_nota: number;
    feedbacks_nao_lidos: number;
  }>;
  feedbacksRecentes: Array<{
    id: number;
    titulo: string;
    tipo_feedback: string;
    nota: number;
    criado_em: string;
    remetente_nome: string;
    destinatario_nome: string;
  }>;
}

export const DashboardManager: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getManager();
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

  const chartData = data.membrosEquipe.map(member => ({
    name: member.nome.split(' ')[0], // Primeiro nome apenas
    total: member.total_feedbacks,
    media: member.media_nota
  }));

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
          <h3 style={{ marginTop: 0 }}>Membros da Equipe</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B82F6' }}>
            {data.membrosEquipe.length}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            colaboradores
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Feedbacks Não Lidos</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#F59E0B' }}>
            {data.membrosEquipe.reduce((acc, member) => acc + member.feedbacks_nao_lidos, 0)}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            pendentes
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginTop: 0 }}>Feedbacks por Colaborador</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" fill="#7D695E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Feedbacks Recentes</h3>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {data.feedbacksRecentes.map((feedback, index) => (
              <div key={feedback.id} style={{ 
                padding: '8px 0',
                borderBottom: index < data.feedbacksRecentes.length - 1 ? '1px solid #374151' : 'none'
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{feedback.titulo}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                  {feedback.remetente_nome} → {feedback.destinatario_nome}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Nota: {feedback.nota}/10 • {new Date(feedback.criado_em).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
            {data.feedbacksRecentes.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                Nenhum feedback recente
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Detalhes da Equipe</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Colaborador</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Total Feedbacks</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Média</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Não Lidos</th>
              </tr>
            </thead>
            <tbody>
              {data.membrosEquipe.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px 8px' }}>{member.nome}</td>
                  <td style={{ padding: '12px 8px' }}>{member.total_feedbacks}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ color: member.media_nota >= 7 ? '#10B981' : member.media_nota >= 5 ? '#F59E0B' : '#EF4444' }}>
                      {member.media_nota.toFixed(1)}/10
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      color: member.feedbacks_nao_lidos > 0 ? '#F59E0B' : '#9CA3AF',
                      fontWeight: member.feedbacks_nao_lidos > 0 ? 600 : 400
                    }}>
                      {member.feedbacks_nao_lidos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
