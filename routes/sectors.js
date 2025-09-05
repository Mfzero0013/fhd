<<<<<<< HEAD
const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar setores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { ativo = 'true' } = req.query;
    
    let query = 'SELECT * FROM setores';
    const params = [];

    if (ativo !== 'all') {
      query += ' WHERE ativo = $1';
      params.push(ativo === 'true');
    }

    query += ' ORDER BY nome';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar setores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar setor por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM setores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar setor (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Verificar se nome já existe
    const existingSector = await pool.query(
      'SELECT id FROM setores WHERE nome = $1',
      [nome]
    );

    if (existingSector.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um setor com este nome' });
    }

    const result = await pool.query(
      'INSERT INTO setores (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );

    res.status(201).json({
      message: 'Setor criado com sucesso',
      sector: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar setor (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;

    // Verificar se setor existe
    const sectorResult = await pool.query('SELECT id FROM setores WHERE id = $1', [id]);
    if (sectorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    // Verificar se nome já existe (exceto para o próprio setor)
    if (nome) {
      const existingSector = await pool.query(
        'SELECT id FROM setores WHERE nome = $1 AND id != $2',
        [nome, id]
      );

      if (existingSector.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um setor com este nome' });
      }
    }

    // Se desativando, verificar se há usuários vinculados
    if (ativo === false) {
      const usersResult = await pool.query(
        'SELECT COUNT(*) as total FROM usuarios WHERE setor_id = $1 AND ativo = true',
        [id]
      );

      if (parseInt(usersResult.rows[0].total) > 0) {
        return res.status(400).json({ 
          message: 'Não é possível desativar setor com usuários vinculados' 
        });
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

    if (descricao !== undefined) {
      paramCount++;
      updateFields.push(`descricao = $${paramCount}`);
      updateValues.push(descricao);
    }

    if (ativo !== undefined) {
      paramCount++;
      updateFields.push(`ativo = $${paramCount}`);
      updateValues.push(ativo);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    updateValues.push(id);

    const query = `UPDATE setores SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Setor atualizado com sucesso',
      sector: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar setor (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se setor existe
    const sectorResult = await pool.query('SELECT id FROM setores WHERE id = $1', [id]);
    if (sectorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    // Verificar se há usuários vinculados
    const usersResult = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE setor_id = $1 AND ativo = true',
      [id]
    );

    if (parseInt(usersResult.rows[0].total) > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar setor com usuários vinculados' 
      });
    }

    // Soft delete - apenas desativar
    await pool.query('UPDATE setores SET ativo = false WHERE id = $1', [id]);

    res.json({ message: 'Setor desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
=======
const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar setores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { ativo = 'true' } = req.query;
    
    let query = 'SELECT * FROM setores';
    const params = [];

    if (ativo !== 'all') {
      query += ' WHERE ativo = $1';
      params.push(ativo === 'true');
    }

    query += ' ORDER BY nome';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar setores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar setor por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM setores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar setor (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Verificar se nome já existe
    const existingSector = await pool.query(
      'SELECT id FROM setores WHERE nome = $1',
      [nome]
    );

    if (existingSector.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um setor com este nome' });
    }

    const result = await pool.query(
      'INSERT INTO setores (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );

    res.status(201).json({
      message: 'Setor criado com sucesso',
      sector: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar setor (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;

    // Verificar se setor existe
    const sectorResult = await pool.query('SELECT id FROM setores WHERE id = $1', [id]);
    if (sectorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    // Verificar se nome já existe (exceto para o próprio setor)
    if (nome) {
      const existingSector = await pool.query(
        'SELECT id FROM setores WHERE nome = $1 AND id != $2',
        [nome, id]
      );

      if (existingSector.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um setor com este nome' });
      }
    }

    // Se desativando, verificar se há usuários vinculados
    if (ativo === false) {
      const usersResult = await pool.query(
        'SELECT COUNT(*) as total FROM usuarios WHERE setor_id = $1 AND ativo = true',
        [id]
      );

      if (parseInt(usersResult.rows[0].total) > 0) {
        return res.status(400).json({ 
          message: 'Não é possível desativar setor com usuários vinculados' 
        });
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

    if (descricao !== undefined) {
      paramCount++;
      updateFields.push(`descricao = $${paramCount}`);
      updateValues.push(descricao);
    }

    if (ativo !== undefined) {
      paramCount++;
      updateFields.push(`ativo = $${paramCount}`);
      updateValues.push(ativo);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    updateValues.push(id);

    const query = `UPDATE setores SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Setor atualizado com sucesso',
      sector: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar setor (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se setor existe
    const sectorResult = await pool.query('SELECT id FROM setores WHERE id = $1', [id]);
    if (sectorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Setor não encontrado' });
    }

    // Verificar se há usuários vinculados
    const usersResult = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE setor_id = $1 AND ativo = true',
      [id]
    );

    if (parseInt(usersResult.rows[0].total) > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar setor com usuários vinculados' 
      });
    }

    // Soft delete - apenas desativar
    await pool.query('UPDATE setores SET ativo = false WHERE id = $1', [id]);

    res.json({ message: 'Setor desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar setor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
