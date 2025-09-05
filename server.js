const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDatabase } = require('./database/supabase-simple');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const feedbackRoutes = require('./routes/feedbacks');
const dashboardRoutes = require('./routes/dashboard');
const sectorRoutes = require('./routes/sectors');
const positionRoutes = require('./routes/positions');
const teamRoutes = require('./routes/teams');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por janela
});
app.use(limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/export', exportRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Inicializar banco e servidor
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
