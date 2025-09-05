const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin, canAccessUser } = require('../middleware/auth');

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tipo = '', setor = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.nome, u.email, u.tipo, u.ativo, u.criado_em,
             s.nome as setor_nome, c.nome as cargo_nome
      FROM usuarios u
      LEFT JOIN setores s ON u.setor_id = s.id
      LEFT JOIN cargos c ON u.cargo_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.nome ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (tipo) {
      paramCount++;
      query += ` AND u.tipo = $${paramCount}`;
      queryParams.push(tipo);
    }

    if (setor) {
      paramCount++;
      query += ` AND s.nome ILIKE $${paramCount}`;
      queryParams.push(`%${setor}%`);
    }

    query += ` ORDER BY u.criado_em DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios u
      LEFT JOIN setores s ON u.setor_id = s.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (u.nome ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (tipo) {
      countParamCount++;
      countQuery += ` AND u.tipo = $${countParamCount}`;
      countParams.push(tipo);
    }

    if (setor) {
      countParamCount++;
      countQuery += ` AND s.nome ILIKE $${countParamCount}`;
      countParams.push(`%${setor}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', authenticateToken, canAccessUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.nome, u.email, u.tipo, u.ativo, u.criado_em,
              s.nome as setor_nome, s.id as setor_id,
              c.nome as cargo_nome, c.id as cargo_id
       FROM usuarios u
       LEFT JOIN setores s ON u.setor_id = s.id
       LEFT JOIN cargos c ON u.cargo_id = c.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, email, senha, tipo, setor_id, cargo_id } = req.body;

    if (!nome || !email || !senha || !tipo || !setor_id || !cargo_id) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!['admin', 'gestor', 'colaborador'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido' });
    }

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Verificar se setor e cargo existem
    const setorResult = await pool.query('SELECT id FROM setores WHERE id = $1 AND ativo = true', [setor_id]);
    const cargoResult = await pool.query('SELECT id FROM cargos WHERE id = $1 AND ativo = true', [cargo_id]);

    if (setorResult.rows.length === 0) {
      return res.status(400).json({ message: 'Setor não encontrado ou inativo' });
    }

    if (cargoResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cargo não encontrado ou inativo' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo, setor_id, cargo_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome, email, tipo, ativo, criado_em`,
      [nome, email, hashedPassword, tipo, setor_id, cargo_id]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', authenticateToken, canAccessUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo, setor_id, cargo_id, ativo } = req.body;
    const currentUser = req.user;

    // Verificar se usuário existe
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Apenas admin pode alterar tipo e ativo
    if (currentUser.tipo !== 'admin' && (tipo !== undefined || ativo !== undefined)) {
      return res.status(403).json({ message: 'Apenas administradores podem alterar tipo e status' });
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (email) {
      const existingUser = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    // Verificar setor e cargo se fornecidos
    if (setor_id) {
      const setorResult = await pool.query('SELECT id FROM setores WHERE id = $1 AND ativo = true', [setor_id]);
      if (setorResult.rows.length === 0) {
        return res.status(400).json({ message: 'Setor não encontrado ou inativo' });
      }
    }

    if (cargo_id) {
      const cargoResult = await pool.query('SELECT id FROM cargos WHERE id = $1 AND ativo = true', [cargo_id]);
      if (cargoResult.rows.length === 0) {
        return res.status(400).json({ message: 'Cargo não encontrado ou inativo' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (nome !== undefined) {
      paramCount++;
      updateFields.push(`nome = $${paramCount}`);
      updateValues.push(nome);
    }

    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
    }

    if (tipo !== undefined && currentUser.tipo === 'admin') {
      paramCount++;
      updateFields.push(`tipo = $${paramCount}`);
      updateValues.push(tipo);
    }

    if (setor_id !== undefined) {
      paramCount++;
      updateFields.push(`setor_id = $${paramCount}`);
      updateValues.push(setor_id);
    }

    if (cargo_id !== undefined) {
      paramCount++;
      updateFields.push(`cargo_id = $${paramCount}`);
      updateValues.push(cargo_id);
    }

    if (ativo !== undefined && currentUser.tipo === 'admin') {
      paramCount++;
      updateFields.push(`ativo = $${paramCount}`);
      updateValues.push(ativo);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    updateValues.push(id);

    const query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const userResult = await pool.query('SELECT id, tipo FROM usuarios WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não permitir deletar a si mesmo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
    }

    // Soft delete - apenas desativar
    await pool.query('UPDATE usuarios SET ativo = false WHERE id = $1', [id]);

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar usuários para feedback (apenas gestores e admins)
router.get('/for-feedback/list', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    let query;
    let params = [];

    if (currentUser.tipo === 'admin') {
      // Admin pode ver todos os usuários ativos
      query = `
        SELECT u.id, u.nome, u.email, u.tipo,
               s.nome as setor_nome, c.nome as cargo_nome
        FROM usuarios u
        LEFT JOIN setores s ON u.setor_id = s.id
        LEFT JOIN cargos c ON u.cargo_id = c.id
        WHERE u.ativo = true
        ORDER BY u.nome
      `;
    } else if (currentUser.tipo === 'gestor') {
      // Gestor pode ver apenas membros da sua equipe
      query = `
        SELECT u.id, u.nome, u.email, u.tipo,
               s.nome as setor_nome, c.nome as cargo_nome
        FROM usuarios u
        LEFT JOIN setores s ON u.setor_id = s.id
        LEFT JOIN cargos c ON u.cargo_id = c.id
        INNER JOIN equipe e ON u.id = e.colaborador_id
        WHERE u.ativo = true AND e.gestor_id = $1
        ORDER BY u.nome
      `;
      params = [currentUser.id];
    } else {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários para feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
