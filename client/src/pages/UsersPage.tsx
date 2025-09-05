import React, { useState, useEffect } from 'react';
import { usersAPI, sectorsAPI, positionsAPI } from '../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'gestor' | 'colaborador';
  ativo: boolean;
  setor_nome?: string;
  cargo_nome?: string;
  criado_em: string;
}

interface Sector {
  id: number;
  nome: string;
}

interface Position {
  id: number;
  nome: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSetor, setFilterSetor] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'colaborador' as 'admin' | 'gestor' | 'colaborador',
    setor_id: '',
    cargo_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, sectorsRes, positionsRes] = await Promise.all([
        usersAPI.getAll({ search, tipo: filterTipo, setor: filterSetor }),
        sectorsAPI.getAll({ ativo: 'true' }),
        positionsAPI.getAll({ ativo: 'true' })
      ]);
      
      setUsers(usersRes.data.users);
      setSectors(sectorsRes.data);
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterTipo, filterSetor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
      } else {
        await usersAPI.create(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      tipo: user.tipo,
      setor_id: '',
      cargo_id: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este usuário?')) {
      try {
        await usersAPI.delete(id);
        loadData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao desativar usuário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'colaborador',
      setor_id: '',
      cargo_id: '',
    });
  };

  const openNewUser = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Usuários</h2>
          <button className="btn btn-primary" onClick={openNewUser}>
            <Plus size={18} /> Novo Usuário
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 16 }}>
          <div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
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
            <option value="admin">Administrador</option>
            <option value="gestor">Gestor</option>
            <option value="colaborador">Colaborador</option>
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
          <button className="btn" onClick={loadData}>
            <Search size={18} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Setor</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Cargo</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 8px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px 8px' }}>{user.nome}</td>
                  <td style={{ padding: '12px 8px' }}>{user.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: user.tipo === 'admin' ? '#DC2626' : user.tipo === 'gestor' ? '#D97706' : '#059669',
                      color: 'white'
                    }}>
                      {user.tipo}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{user.setor_nome || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{user.cargo_nome || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      color: user.ativo ? '#10B981' : '#EF4444'
                    }}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() => handleEdit(user)}
                        style={{ padding: '6px' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(user.id)}
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
          <div className="card" style={{ width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label>Senha {editingUser ? '(deixe em branco para manter)' : '*'}</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  required={!editingUser}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label>Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                  required
                  style={inputStyle}
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
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
                <label>Cargo *</label>
                <select
                  value={formData.cargo_id}
                  onChange={(e) => setFormData({...formData, cargo_id: e.target.value})}
                  required
                  style={inputStyle}
                >
                  <option value="">Selecione um cargo</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>{position.nome}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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
  marginTop: 6
};