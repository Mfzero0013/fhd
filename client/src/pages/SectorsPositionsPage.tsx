import React, { useState, useEffect } from 'react';
import { sectorsAPI, positionsAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Sector {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface Position {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export const SectorsPositionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sectors' | 'positions'>('sectors');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Sector | Position | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectorsRes, positionsRes] = await Promise.all([
        sectorsAPI.getAll({ ativo: 'all' }),
        positionsAPI.getAll({ ativo: 'all' })
      ]);
      
      setSectors(sectorsRes.data);
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'sectors') {
        if (editingItem) {
          await sectorsAPI.update(editingItem.id, formData);
        } else {
          await sectorsAPI.create(formData);
        }
      } else {
        if (editingItem) {
          await positionsAPI.update(editingItem.id, formData);
        } else {
          await positionsAPI.create(formData);
        }
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar item');
    }
  };

  const handleEdit = (item: Sector | Position) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      descricao: item.descricao || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const itemType = activeTab === 'sectors' ? 'setor' : 'cargo';
    if (window.confirm(`Tem certeza que deseja desativar este ${itemType}?`)) {
      try {
        if (activeTab === 'sectors') {
          await sectorsAPI.delete(id);
        } else {
          await positionsAPI.delete(id);
        }
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao desativar item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
    });
  };

  const openNew = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const currentItems = activeTab === 'sectors' ? sectors : positions;
  const itemType = activeTab === 'sectors' ? 'Setor' : 'Cargo';

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Setores & Cargos</h2>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={18} /> Novo {itemType}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            className={`btn ${activeTab === 'sectors' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('sectors')}
          >
            Setores ({sectors.length})
          </button>
          <button
            className={`btn ${activeTab === 'positions' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Cargos ({positions.length})
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Descrição</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px 8px' }}>{item.nome}</td>
                  <td style={{ padding: '12px 8px' }}>{item.descricao || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      color: item.ativo ? '#10B981' : '#EF4444'
                    }}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() => handleEdit(item)}
                        style={{ padding: '6px' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '6px', background: '#DC2626', borderColor: '#DC2626' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="card" style={{ width: '500px' }}>
            <h3 style={{ marginTop: 0 }}>
              {editingItem ? `Editar ${itemType}` : `Novo ${itemType}`}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  rows={3}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
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