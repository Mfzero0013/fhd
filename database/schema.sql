<<<<<<< HEAD
-- Tabela de setores
CREATE TABLE setores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de cargos
CREATE TABLE cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- hash seguro (ex: bcrypt)
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'gestor', 'colaborador')),
    setor_id INT REFERENCES setores(id),
    cargo_id INT REFERENCES cargos(id),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Relacionamento gestor ↔ colaboradores
CREATE TABLE equipe (
    id SERIAL PRIMARY KEY,
    gestor_id INT REFERENCES usuarios(id),
    colaborador_id INT REFERENCES usuarios(id),
    UNIQUE(gestor_id, colaborador_id)
);

-- Tabela de feedbacks
CREATE TABLE feedbacks (
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
CREATE TABLE feedback_visualizacao (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedbacks(id),
    usuario_id INT REFERENCES usuarios(id),
    visualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de auditoria de login
CREATE TABLE login_auditoria (
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
('Financeiro', 'Setor financeiro e contábil');

INSERT INTO cargos (nome, descricao) VALUES 
('Desenvolvedor', 'Desenvolvimento de software'),
('Analista', 'Análise de sistemas e processos'),
('Gerente', 'Gestão de equipe'),
('Coordenador', 'Coordenação de projetos'),
('Assistente', 'Suporte administrativo'),
('Diretor', 'Direção estratégica');

-- Criar usuário administrador padrão (senha será hash no código)
-- A senha 'admin123' será convertida para hash no momento da criação
=======
-- Tabela de setores
CREATE TABLE setores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de cargos
CREATE TABLE cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- hash seguro (ex: bcrypt)
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'gestor', 'colaborador')),
    setor_id INT REFERENCES setores(id),
    cargo_id INT REFERENCES cargos(id),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Relacionamento gestor ↔ colaboradores
CREATE TABLE equipe (
    id SERIAL PRIMARY KEY,
    gestor_id INT REFERENCES usuarios(id),
    colaborador_id INT REFERENCES usuarios(id),
    UNIQUE(gestor_id, colaborador_id)
);

-- Tabela de feedbacks
CREATE TABLE feedbacks (
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
CREATE TABLE feedback_visualizacao (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedbacks(id),
    usuario_id INT REFERENCES usuarios(id),
    visualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de auditoria de login
CREATE TABLE login_auditoria (
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
('Financeiro', 'Setor financeiro e contábil');

INSERT INTO cargos (nome, descricao) VALUES 
('Desenvolvedor', 'Desenvolvimento de software'),
('Analista', 'Análise de sistemas e processos'),
('Gerente', 'Gestão de equipe'),
('Coordenador', 'Coordenação de projetos'),
('Assistente', 'Suporte administrativo'),
('Diretor', 'Direção estratégica');

-- Criar usuário administrador padrão (senha será hash no código)
-- A senha 'admin123' será convertida para hash no momento da criação
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
