const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard do administrador
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Média geral de todas as equipes
    const avgResult = await pool.query(`
      SELECT AVG(nota) as media_geral, COUNT(*) as total_feedbacks
      FROM feedbacks f
      INNER JOIN usuarios u ON f.destinatario_id = u.id
      WHERE u.ativo = true
    `);

    // Número de feedbacks por setor
    const sectorResult = await pool.query(`
      SELECT s.nome as setor, COUNT(f.id) as total_feedbacks, AVG(f.nota) as media_nota
      FROM setores s
      LEFT JOIN feedbacks f ON s.id = f.setor_id
      WHERE s.ativo = true
      GROUP BY s.id, s.nome
      ORDER BY total_feedbacks DESC
    `);

    // Número de feedbacks por usuário
    const userResult = await pool.query(`
      SELECT u.nome, u.email, s.nome as setor, COUNT(f.id) as total_feedbacks, AVG(f.nota) as media_nota
      FROM usuarios u
      LEFT JOIN setores s ON u.setor_id = s.id
      LEFT JOIN feedbacks f ON u.id = f.destinatario_id
      WHERE u.ativo = true
      GROUP BY u.id, u.nome, u.email, s.nome
      ORDER BY total_feedbacks DESC
      LIMIT 10
    `);

    // Tendência de notas (últimos 6 meses)
    const trendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', f.criado_em) as mes,
        AVG(f.nota) as media_nota,
        COUNT(f.id) as total_feedbacks
      FROM feedbacks f
      WHERE f.criado_em >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', f.criado_em)
      ORDER BY mes
    `);

    // Estatísticas gerais
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE ativo = true) as total_usuarios,
        (SELECT COUNT(*) FROM setores WHERE ativo = true) as total_setores,
        (SELECT COUNT(*) FROM cargos WHERE ativo = true) as total_cargos,
        (SELECT COUNT(*) FROM equipe) as total_equipes,
        (SELECT COUNT(*) FROM feedbacks) as total_feedbacks
    `);

    res.json({
      mediaGeral: parseFloat(avgResult.rows[0].media_geral) || 0,
      totalFeedbacks: parseInt(avgResult.rows[0].total_feedbacks) || 0,
      feedbacksPorSetor: sectorResult.rows,
      feedbacksPorUsuario: userResult.rows,
      tendenciaNotas: trendResult.rows,
      estatisticas: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Dashboard do gestor
router.get('/manager', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const userId = req.user.id;

    // Média da equipe
    const teamAvgResult = await pool.query(`
      SELECT AVG(f.nota) as media_equipe, COUNT(f.id) as total_feedbacks
      FROM feedbacks f
      INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id
      WHERE e.gestor_id = $1
    `, [userId]);

    // Número de feedbacks por colaborador da equipe
    const teamMembersResult = await pool.query(`
      SELECT 
        u.id, u.nome, u.email,
        COUNT(f.id) as total_feedbacks,
        AVG(f.nota) as media_nota,
        COUNT(CASE WHEN fv.visualizado_em IS NULL THEN 1 END) as feedbacks_nao_lidos
      FROM equipe e
      INNER JOIN usuarios u ON e.colaborador_id = u.id
      LEFT JOIN feedbacks f ON u.id = f.destinatario_id
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = u.id
      WHERE e.gestor_id = $1 AND u.ativo = true
      GROUP BY u.id, u.nome, u.email
      ORDER BY total_feedbacks DESC
    `, [userId]);

    // Feedbacks recentes da equipe
    const recentFeedbacksResult = await pool.query(`
      SELECT 
        f.id, f.titulo, f.tipo_feedback, f.nota, f.criado_em,
        r.nome as remetente_nome,
        d.nome as destinatario_nome
      FROM feedbacks f
      INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id
      LEFT JOIN usuarios r ON f.remetente_id = r.id
      LEFT JOIN usuarios d ON f.destinatario_id = d.id
      WHERE e.gestor_id = $1
      ORDER BY f.criado_em DESC
      LIMIT 5
    `, [userId]);

    res.json({
      mediaEquipe: parseFloat(teamAvgResult.rows[0].media_equipe) || 0,
      totalFeedbacks: parseInt(teamAvgResult.rows[0].total_feedbacks) || 0,
      membrosEquipe: teamMembersResult.rows,
      feedbacksRecentes: recentFeedbacksResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard gestor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Dashboard do colaborador
router.get('/employee', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Média da equipe (mesmo setor)
    const teamAvgResult = await pool.query(`
      SELECT AVG(f.nota) as media_equipe, COUNT(f.id) as total_feedbacks
      FROM feedbacks f
      INNER JOIN usuarios u ON f.destinatario_id = u.id
      WHERE u.setor_id = (SELECT setor_id FROM usuarios WHERE id = $1)
    `, [userId]);

    // Meus feedbacks
    const myFeedbacksResult = await pool.query(`
      SELECT 
        f.id, f.titulo, f.tipo_feedback, f.nota, f.criado_em,
        r.nome as remetente_nome,
        fv.visualizado_em
      FROM feedbacks f
      LEFT JOIN usuarios r ON f.remetente_id = r.id
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
      WHERE f.destinatario_id = $1
      ORDER BY f.criado_em DESC
      LIMIT 10
    `, [userId]);

    // Feedbacks não lidos
    const unreadResult = await pool.query(`
      SELECT COUNT(*) as total_nao_lidos
      FROM feedbacks f
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1
      WHERE f.destinatario_id = $1 AND fv.visualizado_em IS NULL
    `, [userId]);

    res.json({
      mediaEquipe: parseFloat(teamAvgResult.rows[0].media_equipe) || 0,
      totalFeedbacks: parseInt(teamAvgResult.rows[0].total_feedbacks) || 0,
      meusFeedbacks: myFeedbacksResult.rows,
      feedbacksNaoLidos: parseInt(unreadResult.rows[0].total_nao_lidos) || 0
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard colaborador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas gerais (para todos os tipos)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo;

    let stats = {};

    if (userType === 'admin') {
      // Admin vê todas as estatísticas
      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM usuarios WHERE ativo = true) as total_usuarios,
          (SELECT COUNT(*) FROM feedbacks) as total_feedbacks,
          (SELECT AVG(nota) FROM feedbacks) as media_geral,
          (SELECT COUNT(*) FROM feedbacks WHERE criado_em >= CURRENT_DATE) as feedbacks_hoje
      `);
      stats = result.rows[0];
    } else if (userType === 'gestor') {
      // Gestor vê estatísticas da sua equipe
      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM equipe WHERE gestor_id = $1) as total_membros,
          (SELECT COUNT(*) FROM feedbacks f INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id WHERE e.gestor_id = $1) as total_feedbacks,
          (SELECT AVG(f.nota) FROM feedbacks f INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id WHERE e.gestor_id = $1) as media_equipe,
          (SELECT COUNT(*) FROM feedbacks f INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id WHERE e.gestor_id = $1 AND f.criado_em >= CURRENT_DATE) as feedbacks_hoje
      `, [userId]);
      stats = result.rows[0];
    } else {
      // Colaborador vê suas próprias estatísticas
      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM feedbacks WHERE destinatario_id = $1) as total_feedbacks,
          (SELECT AVG(nota) FROM feedbacks WHERE destinatario_id = $1) as media_pessoal,
          (SELECT COUNT(*) FROM feedbacks WHERE destinatario_id = $1 AND criado_em >= CURRENT_DATE) as feedbacks_hoje,
          (SELECT COUNT(*) FROM feedbacks f LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = $1 WHERE f.destinatario_id = $1 AND fv.visualizado_em IS NULL) as nao_lidos
      `, [userId]);
      stats = result.rows[0];
    }

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
