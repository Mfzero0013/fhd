const express = require('express');
const { pool } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar cargos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { ativo = 'true' } = req.query;
    
    let query = 'SELECT * FROM cargos';
    const params = [];

    if (ativo !== 'all') {
      query += ' WHERE ativo = $1';
      params.push(ativo === 'true');
    }

    query += ' ORDER BY nome';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar cargo por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM cargos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cargo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar cargo (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Verificar se nome já existe
    const existingPosition = await pool.query(
      'SELECT id FROM cargos WHERE nome = $1',
      [nome]
    );

    if (existingPosition.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um cargo com este nome' });
    }

    const result = await pool.query(
      'INSERT INTO cargos (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );

    res.status(201).json({
      message: 'Cargo criado com sucesso',
      position: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar cargo (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;

    // Verificar se cargo existe
    const positionResult = await pool.query('SELECT id FROM cargos WHERE id = $1', [id]);
    if (positionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo não encontrado' });
    }

    // Verificar se nome já existe (exceto para o próprio cargo)
    if (nome) {
      const existingPosition = await pool.query(
        'SELECT id FROM cargos WHERE nome = $1 AND id != $2',
        [nome, id]
      );

      if (existingPosition.rows.length > 0) {
        return res.status(400).json({ message: 'Já existe um cargo com este nome' });
      }
    }

    // Se desativando, verificar se há usuários vinculados
    if (ativo === false) {
      const usersResult = await pool.query(
        'SELECT COUNT(*) as total FROM usuarios WHERE cargo_id = $1 AND ativo = true',
        [id]
      );

      if (parseInt(usersResult.rows[0].total) > 0) {
        return res.status(400).json({ 
          message: 'Não é possível desativar cargo com usuários vinculados' 
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

    const query = `UPDATE cargos SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Cargo atualizado com sucesso',
      position: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar cargo (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cargo existe
    const positionResult = await pool.query('SELECT id FROM cargos WHERE id = $1', [id]);
    if (positionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cargo não encontrado' });
    }

    // Verificar se há usuários vinculados
    const usersResult = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE cargo_id = $1 AND ativo = true',
      [id]
    );

    if (parseInt(usersResult.rows[0].total) > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar cargo com usuários vinculados' 
      });
    }

    // Soft delete - apenas desativar
    await pool.query('UPDATE cargos SET ativo = false WHERE id = $1', [id]);

    res.json({ message: 'Cargo desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
