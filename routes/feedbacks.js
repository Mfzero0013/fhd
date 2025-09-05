const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireManagerOrAdmin, canAccessUser } = require('../middleware/auth');

const router = express.Router();

// Criar feedback
router.post('/', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const { destinatario_id, setor_id, titulo, tipo_feedback, descricao, nota } = req.body;
    const remetente_id = req.user.id;

    if (!destinatario_id || !setor_id || !titulo || !tipo_feedback || !descricao || nota === undefined) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (!['positivo', 'negativo', 'neutro'].includes(tipo_feedback)) {
      return res.status(400).json({ message: 'Tipo de feedback inválido' });
    }

    if (nota < 0 || nota > 10) {
      return res.status(400).json({ message: 'Nota deve estar entre 0 e 10' });
    }

    // Verificar se destinatário existe e está ativo
    const destinatarioResult = await pool.query(
      'SELECT id, tipo FROM usuarios WHERE id = $1 AND ativo = true',
      [destinatario_id]
    );

    if (destinatarioResult.rows.length === 0) {
      return res.status(404).json({ message: 'Destinatário não encontrado ou inativo' });
    }

    // Verificar se setor existe
    const setorResult = await pool.query(
      'SELECT id FROM setores WHERE id = $1 AND ativo = true',
      [setor_id]
    );

    if (setorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado ou inativo' });
    }

    // Se for gestor, verificar se destinatário faz parte da equipe
    if (req.user.tipo === 'gestor') {
      const teamResult = await pool.query(
        'SELECT id FROM equipe WHERE gestor_id = $1 AND colaborador_id = $2',
        [remetente_id, destinatario_id]
      );

      if (teamResult.rows.length === 0) {
        return res.status(403).json({ message: 'Você só pode dar feedback para membros da sua equipe' });
      }
    }

    // Criar feedback
    const result = await pool.query(
      `INSERT INTO feedbacks (remetente_id, destinatario_id, setor_id, titulo, tipo_feedback, descricao, nota)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [remetente_id, destinatario_id, setor_id, titulo, tipo_feedback, descricao, nota]
    );

    res.status(201).json({
      message: 'Feedback criado com sucesso',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar feedbacks recebidos
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = `
      SELECT f.*, 
             r.nome as remetente_nome, r.email as remetente_email,
             s.nome as setor_nome,
             fv.visualizado_em
      FROM feedbacks f
      LEFT JOIN usuarios r ON f.remetente_id = r.id
      LEFT JOIN setores s ON f.setor_id = s.id
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
      WHERE f.destinatario_id = $1
    `;
    const queryParams = [userId];
    let paramCount = 1;

    if (tipo) {
      paramCount++;
      query += ` AND f.tipo_feedback = $${paramCount}`;
      queryParams.push(tipo);
    }

    if (status) {
      if (status === 'lido') {
        query += ` AND fv.visualizado_em IS NOT NULL`;
      } else if (status === 'nao_lido') {
        query += ` AND fv.visualizado_em IS NULL`;
      }
    }

    query += ` ORDER BY f.criado_em DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM feedbacks f
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
      WHERE f.destinatario_id = $1
    `;
    const countParams = [userId];
    let countParamCount = 1;

    if (tipo) {
      countParamCount++;
      countQuery += ` AND f.tipo_feedback = $${countParamCount}`;
      countParams.push(tipo);
    }

    if (status) {
      if (status === 'lido') {
        countQuery += ` AND fv.visualizado_em IS NOT NULL`;
      } else if (status === 'nao_lido') {
        countQuery += ` AND fv.visualizado_em IS NULL`;
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      feedbacks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar feedbacks recebidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar feedbacks enviados
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo = '' } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = `
      SELECT f.*, 
             d.nome as destinatario_nome, d.email as destinatario_email,
             s.nome as setor_nome
      FROM feedbacks f
      LEFT JOIN usuarios d ON f.destinatario_id = d.id
      LEFT JOIN setores s ON f.setor_id = s.id
      WHERE f.remetente_id = $1
    `;
    const queryParams = [userId];
    let paramCount = 1;

    if (tipo) {
      paramCount++;
      query += ` AND f.tipo_feedback = $${paramCount}`;
      queryParams.push(tipo);
    }

    query += ` ORDER BY f.criado_em DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM feedbacks f
      WHERE f.remetente_id = $1
    `;
    const countParams = [userId];

    if (tipo) {
      countQuery += ` AND f.tipo_feedback = $2`;
      countParams.push(tipo);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      feedbacks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar feedbacks enviados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar feedback por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT f.*, 
              r.nome as remetente_nome, r.email as remetente_email,
              d.nome as destinatario_nome, d.email as destinatario_email,
              s.nome as setor_nome,
              fv.visualizado_em
       FROM feedbacks f
       LEFT JOIN usuarios r ON f.remetente_id = r.id
       LEFT JOIN usuarios d ON f.destinatario_id = d.id
       LEFT JOIN setores s ON f.setor_id = s.id
       LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
       WHERE f.id = $2 AND (f.remetente_id = $1 OR f.destinatario_id = $1)`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Feedback não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Marcar feedback como lido
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se feedback existe e se o usuário pode lê-lo
    const feedbackResult = await pool.query(
      'SELECT id FROM feedbacks WHERE id = $1 AND destinatario_id = $2',
      [id, userId]
    );

    if (feedbackResult.rows.length === 0) {
      return res.status(404).json({ message: 'Feedback não encontrado' });
    }

    // Verificar se já foi marcado como lido
    const existingView = await pool.query(
      'SELECT id FROM feedback_visualizacao WHERE feedback_id = $1 AND usuario_id = $2',
      [id, userId]
    );

    if (existingView.rows.length === 0) {
      // Marcar como lido
      await pool.query(
        'INSERT INTO feedback_visualizacao (feedback_id, usuario_id) VALUES ($1, $2)',
        [id, userId]
      );
    }

    res.json({ message: 'Feedback marcado como lido' });
  } catch (error) {
    console.error('Erro ao marcar feedback como lido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar feedback (apenas quem enviou)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se feedback existe e se o usuário pode deletá-lo
    const feedbackResult = await pool.query(
      'SELECT id FROM feedbacks WHERE id = $1 AND remetente_id = $2',
      [id, userId]
    );

    if (feedbackResult.rows.length === 0) {
      return res.status(404).json({ message: 'Feedback não encontrado ou você não tem permissão para deletá-lo' });
    }

    // Deletar feedback
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [id]);

    res.json({ message: 'Feedback deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar feedbacks não lidos
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*) as total
       FROM feedbacks f
       LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
       WHERE f.destinatario_id = $1 AND fv.visualizado_em IS NULL`,
      [userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].total) });
  } catch (error) {
    console.error('Erro ao contar feedbacks não lidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
