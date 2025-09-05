const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const userResult = await pool.query(
      'SELECT id, nome, email, tipo, ativo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].ativo) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Middleware de autorização por tipo de usuário
const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!allowedTypes.includes(req.user.tipo)) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};

// Middleware específico para admin
const requireAdmin = authorize('admin');

// Middleware específico para gestor
const requireManager = authorize('gestor');

// Middleware específico para gestor ou admin
const requireManagerOrAdmin = authorize('gestor', 'admin');

// Middleware para verificar se o usuário pode acessar dados de outro usuário
const canAccessUser = async (req, res, next) => {
  const { userId } = req.params;
  const currentUser = req.user;

  // Admin pode acessar qualquer usuário
  if (currentUser.tipo === 'admin') {
    return next();
  }

  // Gestor pode acessar apenas membros da sua equipe
  if (currentUser.tipo === 'gestor') {
    const teamResult = await pool.query(
      'SELECT id FROM equipe WHERE gestor_id = $1 AND colaborador_id = $2',
      [currentUser.id, userId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(403).json({ message: 'Acesso negado. Usuário não faz parte da sua equipe.' });
    }
  }

  // Colaborador pode acessar apenas seus próprios dados
  if (currentUser.tipo === 'colaborador' && currentUser.id !== parseInt(userId)) {
    return res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireManager,
  requireManagerOrAdmin,
  canAccessUser
};
