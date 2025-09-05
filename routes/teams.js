const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar equipes (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, gestor = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.id, e.gestor_id, e.colaborador_id,
             g.nome as gestor_nome, g.email as gestor_email,
             c.nome as colaborador_nome, c.email as colaborador_email,
             e.gestor_id || '-' || e.colaborador_id as team_key
      FROM equipe e
      LEFT JOIN usuarios g ON e.gestor_id = g.id
      LEFT JOIN usuarios c ON e.colaborador_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (gestor) {
      paramCount++;
      query += ` AND (g.nome ILIKE $${paramCount} OR g.email ILIKE $${paramCount})`;
      queryParams.push(`%${gestor}%`);
    }

    query += ` ORDER BY g.nome, c.nome LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM equipe e
      LEFT JOIN usuarios g ON e.gestor_id = g.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (gestor) {
      countParamCount++;
      countQuery += ` AND (g.nome ILIKE $${countParamCount} OR g.email ILIKE $${countParamCount})`;
      countParams.push(`%${gestor}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      teams: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar equipes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar membros da equipe do gestor
router.get('/my-team', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.tipo === 'admin') {
      // Admin pode ver todas as equipes
      const result = await pool.query(
        `SELECT e.id, e.gestor_id, e.colaborador_id,
                g.nome as gestor_nome, g.email as gestor_email,
                c.nome as colaborador_nome, c.email as colaborador_email,
                s.nome as setor_nome, pos.nome as cargo_nome
         FROM equipe e
         LEFT JOIN usuarios g ON e.gestor_id = g.id
         LEFT JOIN usuarios c ON e.colaborador_id = c.id
         LEFT JOIN setores s ON c.setor_id = s.id
         LEFT JOIN cargos pos ON c.cargo_id = pos.id
         ORDER BY g.nome, c.nome`
      );
      res.json(result.rows);
    } else {
      // Gestor vê apenas sua equipe
      const result = await pool.query(
        `SELECT e.id, e.gestor_id, e.colaborador_id,
                g.nome as gestor_nome, g.email as gestor_email,
                c.nome as colaborador_nome, c.email as colaborador_email,
                s.nome as setor_nome, pos.nome as cargo_nome
         FROM equipe e
         LEFT JOIN usuarios g ON e.gestor_id = g.id
         LEFT JOIN usuarios c ON e.colaborador_id = c.id
         LEFT JOIN setores s ON c.setor_id = s.id
         LEFT JOIN cargos pos ON c.cargo_id = pos.id
         WHERE e.gestor_id = $1
         ORDER BY c.nome`,
        [userId]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Erro ao listar equipe:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar membro à equipe (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gestor_id, colaborador_id } = req.body;

    if (!gestor_id || !colaborador_id) {
      return res.status(400).json({ message: 'ID do gestor e colaborador são obrigatórios' });
    }

    if (gestor_id === colaborador_id) {
      return res.status(400).json({ message: 'Gestor não pode ser o mesmo que colaborador' });
    }

    // Verificar se gestor existe e é do tipo gestor
    const gestorResult = await pool.query(
      'SELECT id, tipo FROM usuarios WHERE id = $1 AND ativo = true',
      [gestor_id]
    );

    if (gestorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Gestor não encontrado ou inativo' });
    }

    if (gestorResult.rows[0].tipo !== 'gestor') {
      return res.status(400).json({ message: 'Usuário deve ser do tipo gestor' });
    }

    // Verificar se colaborador existe e é do tipo colaborador
    const colaboradorResult = await pool.query(
      'SELECT id, tipo FROM usuarios WHERE id = $1 AND ativo = true',
      [colaborador_id]
    );

    if (colaboradorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado ou inativo' });
    }

    if (colaboradorResult.rows[0].tipo !== 'colaborador') {
      return res.status(400).json({ message: 'Usuário deve ser do tipo colaborador' });
    }

    // Verificar se já existe a relação
    const existingTeam = await pool.query(
      'SELECT id FROM equipe WHERE gestor_id = $1 AND colaborador_id = $2',
      [gestor_id, colaborador_id]
    );

    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ message: 'Colaborador já faz parte desta equipe' });
    }

    // Criar relação
    const result = await pool.query(
      'INSERT INTO equipe (gestor_id, colaborador_id) VALUES ($1, $2) RETURNING *',
      [gestor_id, colaborador_id]
    );

    res.status(201).json({
      message: 'Membro adicionado à equipe com sucesso',
      team: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar membro à equipe:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Remover membro da equipe (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se relação existe
    const teamResult = await pool.query('SELECT id FROM equipe WHERE id = $1', [id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Relação de equipe não encontrada' });
    }

    // Remover relação
    await pool.query('DELETE FROM equipe WHERE id = $1', [id]);

    res.json({ message: 'Membro removido da equipe com sucesso' });
  } catch (error) {
    console.error('Erro ao remover membro da equipe:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar gestores disponíveis (apenas admin)
router.get('/managers/available', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, email, s.nome as setor_nome
       FROM usuarios u
       LEFT JOIN setores s ON u.setor_id = s.id
       WHERE u.tipo = 'gestor' AND u.ativo = true
       ORDER BY u.nome`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar gestores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar colaboradores disponíveis (apenas admin)
router.get('/employees/available', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nome, u.email, s.nome as setor_nome, c.nome as cargo_nome
       FROM usuarios u
       LEFT JOIN setores s ON u.setor_id = s.id
       LEFT JOIN cargos c ON u.cargo_id = c.id
       WHERE u.tipo = 'colaborador' AND u.ativo = true
       ORDER BY u.nome`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar colaboradores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
