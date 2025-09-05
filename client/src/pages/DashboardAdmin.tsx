import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardAPI } from '../services/api';

interface DashboardData {
  mediaGeral: number;
  totalFeedbacks: number;
  feedbacksPorSetor: Array<{
    setor: string;
    total_feedbacks: number;
    media_nota: number;
  }>;
  feedbacksPorUsuario: Array<{
    nome: string;
    email: string;
    setor: string;
    total_feedbacks: number;
    media_nota: number;
  }>;
  tendenciaNotas: Array<{
    mes: string;
    media_nota: number;
    total_feedbacks: number;
  }>;
  estatisticas: {
    total_usuarios: number;
    total_setores: number;
    total_cargos: number;
    total_equipes: number;
    total_feedbacks: number;
  };
}

export const DashboardAdmin: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAdmin();
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

  const chartData = data.feedbacksPorSetor.map(item => ({
    name: item.setor,
    total: item.total_feedbacks,
    media: item.media_nota
  }));

  const trendData = data.tendenciaNotas.map(item => ({
    name: new Date(item.mes).toLocaleDateString('pt-BR', { month: 'short' }),
    media: item.media_nota
  }));

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Média Geral</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#10B981' }}>
            {data.mediaGeral.toFixed(1)}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            {data.totalFeedbacks} feedbacks
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Total de Usuários</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B82F6' }}>
            {data.estatisticas.total_usuarios}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            {data.estatisticas.total_setores} setores
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Total de Equipes</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#8B5CF6' }}>
            {data.estatisticas.total_equipes}
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>
            {data.estatisticas.total_cargos} cargos
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Feedbacks por Setor</h3>
          <div style={{ height: 220 }}>
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
                <Bar dataKey="total" fill="#0A2342" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Tendência de Notas</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis domain={[0, 10]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  dataKey="media" 
                  stroke="#7D695E" 
                  strokeWidth={2} 
                  dot={{ fill: '#7D695E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Top Usuários</h3>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {data.feedbacksPorUsuario.slice(0, 5).map((user, index) => (
              <div key={user.email} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < 4 ? '1px solid #374151' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.nome}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user.setor}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{user.total_feedbacks}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {user.media_nota.toFixed(1)}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


