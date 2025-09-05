-- Execute este SQL no SQL Editor do Supabase

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

-- Inserir dados iniciais
INSERT INTO setores (nome, descricao) VALUES 
('Tecnologia', 'Setor responsável por desenvolvimento e infraestrutura'),
('Recursos Humanos', 'Setor de gestão de pessoas'),
('Vendas', 'Setor comercial'),
('Marketing', 'Setor de comunicação e marketing'),
('Financeiro', 'Setor financeiro e contábil')
ON CONFLICT DO NOTHING;

INSERT INTO cargos (nome, descricao) VALUES 
('Desenvolvedor', 'Desenvolvimento de software'),
('Analista', 'Análise de sistemas e processos'),
('Gerente', 'Gestão de equipe'),
('Coordenador', 'Coordenação de projetos'),
('Assistente', 'Suporte administrativo'),
('Diretor', 'Direção estratégica')
ON CONFLICT DO NOTHING;

-- Criar usuário administrador (senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo, setor_id, cargo_id) 
VALUES (
  'Administrador',
  'admin@empresa.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: admin123
  'admin',
  (SELECT id FROM setores LIMIT 1),
  (SELECT id FROM cargos LIMIT 1)
)
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE feedback_visualizacao ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE login_auditoria ENABLE ROW LEVEL SECURITY;
