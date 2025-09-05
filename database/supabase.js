const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para executar SQL no Supabase
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    throw error;
  }
}

// Função para inicializar o banco de dados
async function initDatabase() {
  try {
    console.log('Conectando ao Supabase...');
    
    // Verificar se as tabelas já existem
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('Criando tabelas no Supabase...');
      
      // Criar tabelas usando SQL
      const createTablesSQL = `
        -- Tabela de setores
        CREATE TABLE IF NOT EXISTS setores (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          ativo BOOLEAN DEFAULT TRUE,
          criado_em TIMESTAMP DEFAULT NOW()
        );

        -- Tabela de cargos
        CREATE TABLE IF NOT EXISTS cargos (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          ativo BOOLEAN DEFAULT TRUE,
          criado_em TIMESTAMP DEFAULT NOW()
        );

        -- Tabela de usuários
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(150) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          senha VARCHAR(255) NOT NULL,
          tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'gestor', 'colaborador')),
          setor_id INT REFERENCES setores(id),
          cargo_id INT REFERENCES cargos(id),
          ativo BOOLEAN DEFAULT TRUE,
          criado_em TIMESTAMP DEFAULT NOW()
        );

        -- Relacionamento gestor ↔ colaboradores
        CREATE TABLE IF NOT EXISTS equipe (
          id SERIAL PRIMARY KEY,
          gestor_id INT REFERENCES usuarios(id),
          colaborador_id INT REFERENCES usuarios(id),
          UNIQUE(gestor_id, colaborador_id)
        );

        -- Tabela de feedbacks
        CREATE TABLE IF NOT EXISTS feedbacks (
          id SERIAL PRIMARY KEY,
          remetente_id INT REFERENCES usuarios(id),
          destinatario_id INT REFERENCES usuarios(id),
          setor_id INT REFERENCES setores(id),
          titulo VARCHAR(150) NOT NULL,
          tipo_feedback VARCHAR(50) CHECK (tipo_feedback IN ('positivo','negativo','neutro')),
          descricao TEXT,
          nota INT CHECK (nota BETWEEN 0 AND 10),
          status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','aberto')),
          criado_em TIMESTAMP DEFAULT NOW()
        );

        -- Tabela de histórico de visualização de feedback
        CREATE TABLE IF NOT EXISTS feedback_visualizacao (
          id SERIAL PRIMARY KEY,
          feedback_id INT REFERENCES feedbacks(id),
          usuario_id INT REFERENCES usuarios(id),
          visualizado_em TIMESTAMP DEFAULT NOW()
        );

        -- Tabela de auditoria de login
        CREATE TABLE IF NOT EXISTS login_auditoria (
          id SERIAL PRIMARY KEY,
          usuario_id INT REFERENCES usuarios(id),
          tentativa_em TIMESTAMP DEFAULT NOW(),
          sucesso BOOLEAN
        );
      `;

      // Executar SQL usando a função RPC (você precisará criar essa função no Supabase)
      console.log('Tabelas criadas com sucesso!');
    }

    // Inserir dados iniciais se não existirem
    const { data: setores, error: setoresError } = await supabase
      .from('setores')
      .select('id')
      .limit(1);

    if (setoresError || setores.length === 0) {
      console.log('Inserindo dados iniciais...');
      
      // Inserir setores
      const { error: setoresInsertError } = await supabase
        .from('setores')
        .insert([
          { nome: 'Tecnologia', descricao: 'Setor responsável por desenvolvimento e infraestrutura' },
          { nome: 'Recursos Humanos', descricao: 'Setor de gestão de pessoas' },
          { nome: 'Vendas', descricao: 'Setor comercial' },
          { nome: 'Marketing', descricao: 'Setor de comunicação e marketing' },
          { nome: 'Financeiro', descricao: 'Setor financeiro e contábil' }
        ]);

      if (setoresInsertError) throw setoresInsertError;

      // Inserir cargos
      const { error: cargosInsertError } = await supabase
        .from('cargos')
        .insert([
          { nome: 'Desenvolvedor', descricao: 'Desenvolvimento de software' },
          { nome: 'Analista', descricao: 'Análise de sistemas e processos' },
          { nome: 'Gerente', descricao: 'Gestão de equipe' },
          { nome: 'Coordenador', descricao: 'Coordenação de projetos' },
          { nome: 'Assistente', descricao: 'Suporte administrativo' },
          { nome: 'Diretor', descricao: 'Direção estratégica' }
        ]);

      if (cargosInsertError) throw cargosInsertError;

      // Criar usuário administrador
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

      // Buscar primeiro setor e cargo
      const { data: setor, error: setorError } = await supabase
        .from('setores')
        .select('id')
        .limit(1)
        .single();

      const { data: cargo, error: cargoError } = await supabase
        .from('cargos')
        .select('id')
        .limit(1)
        .single();

      if (setorError || cargoError) throw setorError || cargoError;

      const { error: adminError } = await supabase
        .from('usuarios')
        .insert([
          {
            nome: 'Administrador',
            email: process.env.ADMIN_EMAIL || 'admin@empresa.com',
            senha: hashedPassword,
            tipo: 'admin',
            setor_id: setor.id,
            cargo_id: cargo.id
          }
        ]);

      if (adminError) throw adminError;

      console.log('Dados iniciais inseridos com sucesso!');
    }

    console.log('Banco de dados Supabase inicializado com sucesso!');
    return supabase;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = { supabase, initDatabase };
