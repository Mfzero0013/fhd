const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const userResult = await pool.query(
      `SELECT u.id, u.nome, u.email, u.senha, u.tipo, u.ativo, u.setor_id, u.cargo_id,
              s.nome as setor_nome, c.nome as cargo_nome
       FROM usuarios u
       LEFT JOIN setores s ON u.setor_id = s.id
       LEFT JOIN cargos c ON u.cargo_id = c.id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      // Registrar tentativa de login falhada
      await pool.query(
        'INSERT INTO login_auditoria (usuario_id, sucesso) VALUES (NULL, false)'
      );
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];

    if (!user.ativo) {
      return res.status(401).json({ message: 'Conta desativada' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      // Registrar tentativa de login falhada
      await pool.query(
        'INSERT INTO login_auditoria (usuario_id, sucesso) VALUES ($1, false)',
        [user.id]
      );
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Registrar login bem-sucedido
    await pool.query(
      'INSERT INTO login_auditoria (usuario_id, sucesso) VALUES ($1, true)',
      [user.id]
    );

    // Remover senha da resposta
    const { senha: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Alterar senha
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar usuário atual
    const userResult = await pool.query(
      'SELECT senha FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(senhaAtual, userResult.rows[0].senha);
    if (!validPassword) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout (registrar no banco se necessário)
router.post('/logout', authenticateToken, (req, res) => {
  // Em um sistema JWT, o logout é feito no frontend removendo o token
  // Aqui podemos registrar o logout se necessário
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;
