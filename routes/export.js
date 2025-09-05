const express = require('express');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin, requireManagerOrAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Exportar relatórios CSV (admin - todos os feedbacks)
router.get('/feedbacks/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      dataInicio, 
      dataFim, 
      setor_id, 
      tipo_feedback, 
      usuario_id 
    } = req.query;

    let query = `
      SELECT 
        f.id,
        f.titulo,
        f.tipo_feedback,
        f.descricao,
        f.nota,
        f.status,
        f.criado_em,
        r.nome as remetente_nome,
        r.email as remetente_email,
        d.nome as destinatario_nome,
        d.email as destinatario_email,
        s.nome as setor_nome,
        sr.nome as setor_remetente,
        fv.visualizado_em
      FROM feedbacks f
      LEFT JOIN usuarios r ON f.remetente_id = r.id
      LEFT JOIN usuarios d ON f.destinatario_id = d.id
      LEFT JOIN setores s ON f.setor_id = s.id
      LEFT JOIN setores sr ON r.setor_id = sr.id
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = d.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    // Filtros
    if (dataInicio) {
      paramCount++;
      query += ` AND f.criado_em >= $${paramCount}`;
      queryParams.push(dataInicio);
    }

    if (dataFim) {
      paramCount++;
      query += ` AND f.criado_em <= $${paramCount}`;
      queryParams.push(dataFim);
    }

    if (setor_id) {
      paramCount++;
      query += ` AND f.setor_id = $${paramCount}`;
      queryParams.push(setor_id);
    }

    if (tipo_feedback) {
      paramCount++;
      query += ` AND f.tipo_feedback = $${paramCount}`;
      queryParams.push(tipo_feedback);
    }

    if (usuario_id) {
      paramCount++;
      query += ` AND (f.remetente_id = $${paramCount} OR f.destinatario_id = $${paramCount})`;
      queryParams.push(usuario_id);
    }

    query += ` ORDER BY f.criado_em DESC`;

    const result = await pool.query(query, queryParams);

    // Configurar CSV
    const csvWriter = createCsvWriter({
      path: 'temp_feedbacks_admin.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'titulo', title: 'Título' },
        { id: 'tipo_feedback', title: 'Tipo' },
        { id: 'descricao', title: 'Descrição' },
        { id: 'nota', title: 'Nota' },
        { id: 'status', title: 'Status' },
        { id: 'criado_em', title: 'Data Criação' },
        { id: 'remetente_nome', title: 'Remetente' },
        { id: 'remetente_email', title: 'Email Remetente' },
        { id: 'destinatario_nome', title: 'Destinatário' },
        { id: 'destinatario_email', title: 'Email Destinatário' },
        { id: 'setor_nome', title: 'Setor' },
        { id: 'setor_remetente', title: 'Setor Remetente' },
        { id: 'visualizado_em', title: 'Visualizado Em' }
      ]
    });

    // Processar dados para CSV
    const csvData = result.rows.map(row => ({
      ...row,
      criado_em: moment(row.criado_em).format('DD/MM/YYYY HH:mm:ss'),
      visualizado_em: row.visualizado_em ? moment(row.visualizado_em).format('DD/MM/YYYY HH:mm:ss') : 'Não lido'
    }));

    await csvWriter.writeRecords(csvData);

    // Enviar arquivo
    res.download('temp_feedbacks_admin.csv', `feedbacks_admin_${moment().format('YYYY-MM-DD')}.csv`, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
      }
      // Deletar arquivo temporário
      require('fs').unlink('temp_feedbacks_admin.csv', (unlinkErr) => {
        if (unlinkErr) console.error('Erro ao deletar arquivo temporário:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('Erro ao exportar feedbacks admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Exportar relatórios CSV (gestor - apenas sua equipe)
router.get('/feedbacks/manager', authenticateToken, requireManagerOrAdmin, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      dataInicio, 
      dataFim, 
      tipo_feedback, 
      colaborador_id 
    } = req.query;

    let query = `
      SELECT 
        f.id,
        f.titulo,
        f.tipo_feedback,
        f.descricao,
        f.nota,
        f.status,
        f.criado_em,
        r.nome as remetente_nome,
        r.email as remetente_email,
        d.nome as destinatario_nome,
        d.email as destinatario_email,
        s.nome as setor_nome,
        fv.visualizado_em
      FROM feedbacks f
      INNER JOIN equipe e ON f.destinatario_id = e.colaborador_id
      LEFT JOIN usuarios r ON f.remetente_id = r.id
      LEFT JOIN usuarios d ON f.destinatario_id = d.id
      LEFT JOIN setores s ON f.setor_id = s.id
      LEFT JOIN feedback_visualizacao fv ON f.id = fv.feedback_id AND fv.usuario_id = d.id
      WHERE e.gestor_id = $1
    `;

    const queryParams = [userId];
    let paramCount = 1;

    // Filtros
    if (dataInicio) {
      paramCount++;
      query += ` AND f.criado_em >= $${paramCount}`;
      queryParams.push(dataInicio);
    }

    if (dataFim) {
      paramCount++;
      query += ` AND f.criado_em <= $${paramCount}`;
      queryParams.push(dataFim);
    }

    if (tipo_feedback) {
      paramCount++;
      query += ` AND f.tipo_feedback = $${paramCount}`;
      queryParams.push(tipo_feedback);
    }

    if (colaborador_id) {
      paramCount++;
      query += ` AND f.destinatario_id = $${paramCount}`;
      queryParams.push(colaborador_id);
    }

    query += ` ORDER BY f.criado_em DESC`;

    const result = await pool.query(query, queryParams);

    // Configurar CSV
    const csvWriter = createCsvWriter({
      path: 'temp_feedbacks_gestor.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'titulo', title: 'Título' },
        { id: 'tipo_feedback', title: 'Tipo' },
        { id: 'descricao', title: 'Descrição' },
        { id: 'nota', title: 'Nota' },
        { id: 'status', title: 'Status' },
        { id: 'criado_em', title: 'Data Criação' },
        { id: 'remetente_nome', title: 'Remetente' },
        { id: 'remetente_email', title: 'Email Remetente' },
        { id: 'destinatario_nome', title: 'Destinatário' },
        { id: 'destinatario_email', title: 'Email Destinatário' },
        { id: 'setor_nome', title: 'Setor' },
        { id: 'visualizado_em', title: 'Visualizado Em' }
      ]
    });

    // Processar dados para CSV
    const csvData = result.rows.map(row => ({
      ...row,
      criado_em: moment(row.criado_em).format('DD/MM/YYYY HH:mm:ss'),
      visualizado_em: row.visualizado_em ? moment(row.visualizado_em).format('DD/MM/YYYY HH:mm:ss') : 'Não lido'
    }));

    await csvWriter.writeRecords(csvData);

    // Enviar arquivo
    res.download('temp_feedbacks_gestor.csv', `feedbacks_equipe_${moment().format('YYYY-MM-DD')}.csv`, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
      }
      // Deletar arquivo temporário
      require('fs').unlink('temp_feedbacks_gestor.csv', (unlinkErr) => {
        if (unlinkErr) console.error('Erro ao deletar arquivo temporário:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('Erro ao exportar feedbacks gestor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Exportar usuários (apenas admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tipo, setor_id, ativo = 'true' } = req.query;

    let query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.tipo,
        u.ativo,
        u.criado_em,
        s.nome as setor_nome,
        c.nome as cargo_nome
      FROM usuarios u
      LEFT JOIN setores s ON u.setor_id = s.id
      LEFT JOIN cargos c ON u.cargo_id = c.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    if (tipo) {
      paramCount++;
      query += ` AND u.tipo = $${paramCount}`;
      queryParams.push(tipo);
    }

    if (setor_id) {
      paramCount++;
      query += ` AND u.setor_id = $${paramCount}`;
      queryParams.push(setor_id);
    }

    if (ativo !== 'all') {
      paramCount++;
      query += ` AND u.ativo = $${paramCount}`;
      queryParams.push(ativo === 'true');
    }

    query += ` ORDER BY u.nome`;

    const result = await pool.query(query, queryParams);

    // Configurar CSV
    const csvWriter = createCsvWriter({
      path: 'temp_usuarios.csv',
      header: [
        { id: 'id', title: 'ID' },
        { id: 'nome', title: 'Nome' },
        { id: 'email', title: 'Email' },
        { id: 'tipo', title: 'Tipo' },
        { id: 'ativo', title: 'Ativo' },
        { id: 'criado_em', title: 'Data Criação' },
        { id: 'setor_nome', title: 'Setor' },
        { id: 'cargo_nome', title: 'Cargo' }
      ]
    });

    // Processar dados para CSV
    const csvData = result.rows.map(row => ({
      ...row,
      ativo: row.ativo ? 'Sim' : 'Não',
      criado_em: moment(row.criado_em).format('DD/MM/YYYY HH:mm:ss')
    }));

    await csvWriter.writeRecords(csvData);

    // Enviar arquivo
    res.download('temp_usuarios.csv', `usuarios_${moment().format('YYYY-MM-DD')}.csv`, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
      }
      // Deletar arquivo temporário
      require('fs').unlink('temp_usuarios.csv', (unlinkErr) => {
        if (unlinkErr) console.error('Erro ao deletar arquivo temporário:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('Erro ao exportar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
