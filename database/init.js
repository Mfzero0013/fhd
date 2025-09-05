<<<<<<< HEAD
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'feedback360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function initDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Ler e executar o schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Schema criado com sucesso!');
    
    // Verificar se o admin já existe
    const adminExists = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [process.env.ADMIN_EMAIL || 'admin@empresa.com']
    );
    
    if (adminExists.rows.length === 0) {
      // Criar usuário administrador padrão
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      // Buscar o primeiro setor e cargo para o admin
      const setorResult = await pool.query('SELECT id FROM setores LIMIT 1');
      const cargoResult = await pool.query('SELECT id FROM cargos LIMIT 1');
      
      if (setorResult.rows.length > 0 && cargoResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO usuarios (nome, email, senha, tipo, setor_id, cargo_id) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'Administrador',
            process.env.ADMIN_EMAIL || 'admin@empresa.com',
            hashedPassword,
            'admin',
            setorResult.rows[0].id,
            cargoResult.rows[0].id
          ]
        );
        console.log('Usuário administrador criado com sucesso!');
      }
    } else {
      console.log('Usuário administrador já existe.');
    }
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase };
=======
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'feedback360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function initDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Ler e executar o schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Schema criado com sucesso!');
    
    // Verificar se o admin já existe
    const adminExists = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [process.env.ADMIN_EMAIL || 'admin@empresa.com']
    );
    
    if (adminExists.rows.length === 0) {
      // Criar usuário administrador padrão
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      // Buscar o primeiro setor e cargo para o admin
      const setorResult = await pool.query('SELECT id FROM setores LIMIT 1');
      const cargoResult = await pool.query('SELECT id FROM cargos LIMIT 1');
      
      if (setorResult.rows.length > 0 && cargoResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO usuarios (nome, email, senha, tipo, setor_id, cargo_id) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'Administrador',
            process.env.ADMIN_EMAIL || 'admin@empresa.com',
            hashedPassword,
            'admin',
            setorResult.rows[0].id,
            cargoResult.rows[0].id
          ]
        );
        console.log('Usuário administrador criado com sucesso!');
      }
    } else {
      console.log('Usuário administrador já existe.');
    }
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase };
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
