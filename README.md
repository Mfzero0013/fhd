<<<<<<< HEAD
# Feedback360

Sistema web para centralizar e organizar feedbacks entre colaboradores, gestores e administradores.

## 🚀 Funcionalidades

### Perfis de Usuário

#### 👑 Administrador
- Conta inicial: `admin@empresa.com` / `admin123`
- Gerencia todos os setores, cargos, equipes e usuários
- Cria feedback para qualquer gestor ou colaborador
- Dashboard com métricas gerais do sistema
- Exportação de relatórios CSV completos
- Histórico global de feedbacks

#### 👨‍💼 Gestor
- Visualiza apenas sua equipe
- Cria feedback para membros da equipe
- Dashboard com métricas da equipe
- Exportação de relatórios da equipe
- Visualiza feedbacks não lidos

#### 👤 Colaborador
- Visualiza apenas feedbacks recebidos
- Dashboard com média da equipe
- Lista de feedbacks não lidos

### 🎯 Funcionalidades Principais

- **Sistema de Login** com autenticação JWT
- **Gestão de Usuários** (CRUD completo)
- **Gestão de Setores e Cargos**
- **Sistema de Feedbacks** com notas de 0-10
- **Dashboards Interativos** com gráficos
- **Notificações** de feedbacks não lidos
- **Exportação CSV** com filtros avançados
- **Interface Responsiva** para desktop e mobile

## 🛠️ Tecnologias

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT para autenticação
- Bcrypt para hash de senhas
- CORS e Helmet para segurança

### Frontend
- React + TypeScript
- React Router para navegação
- Recharts para gráficos
- Lucide React para ícones
- Axios para requisições HTTP

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd feedback
```

### 2. Instale as dependências
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configure o banco de dados
```bash
# Crie um banco PostgreSQL chamado 'feedback360'
createdb feedback360

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Inicialize o banco de dados
```bash
# O banco será inicializado automaticamente na primeira execução
# ou execute manualmente:
node database/init.js
```

### 5. Execute o projeto
```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Ou execute separadamente:
# Backend
npm run server

# Frontend
cd client && npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feedback360
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=admin123
```

## 📊 Estrutura do Banco de Dados

- **setores**: Setores da empresa
- **cargos**: Cargos/funções
- **usuarios**: Usuários do sistema
- **equipe**: Relacionamento gestor-colaborador
- **feedbacks**: Feedbacks entre usuários
- **feedback_visualizacao**: Controle de leitura
- **login_auditoria**: Log de tentativas de login

## 🎨 Design System

### Paleta de Cores
- **Azul Escuro**: #0A2342 (primary)
- **Preto**: #000000
- **Marrom Claro**: RGB(125, 105, 94)
- **Background**: #0F172A
- **Surface**: #111827

### Componentes
- Cards com bordas arredondadas
- Botões com gradientes sutis
- Gráficos interativos
- Layout responsivo

## 🚀 Deploy

### Heroku
```bash
# Instale o Heroku CLI
# Configure as variáveis de ambiente no Heroku
# Faça o deploy
git push heroku main
```

### Docker
```bash
# Build da imagem
docker build -t feedback360 .

# Execute o container
docker run -p 5000:5000 feedback360
```

## 📱 Uso

1. **Login**: Use `admin@empresa.com` / `admin123`
2. **Criar Usuários**: Acesse "Usuários" (apenas admin)
3. **Configurar Equipes**: Defina gestores e colaboradores
4. **Criar Feedbacks**: Use a aba "Feedback"
5. **Visualizar Dashboards**: Métricas por perfil de usuário
6. **Exportar Dados**: Use a aba "Exportar CSV"

## 🔒 Segurança

- Senhas com hash bcrypt
- Autenticação JWT
- Rate limiting
- CORS configurado
- Validação de dados
- Soft delete para usuários

## 📈 Métricas

### Admin
- Média geral de todas as equipes
- Feedbacks por setor
- Tendência de notas
- Top usuários

### Gestor
- Média da equipe
- Feedbacks por colaborador
- Feedbacks não lidos

### Colaborador
- Média da equipe
- Seus feedbacks recebidos
- Contador de não lidos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para suporte, entre em contato através dos issues do GitHub ou email.

---

**Feedback360** - Sistema de Gestão de Feedbacks Corporativos
=======
# Feedback360

Sistema web para centralizar e organizar feedbacks entre colaboradores, gestores e administradores.

## 🚀 Funcionalidades

### Perfis de Usuário

#### 👑 Administrador
- Conta inicial: `admin@empresa.com` / `admin123`
- Gerencia todos os setores, cargos, equipes e usuários
- Cria feedback para qualquer gestor ou colaborador
- Dashboard com métricas gerais do sistema
- Exportação de relatórios CSV completos
- Histórico global de feedbacks

#### 👨‍💼 Gestor
- Visualiza apenas sua equipe
- Cria feedback para membros da equipe
- Dashboard com métricas da equipe
- Exportação de relatórios da equipe
- Visualiza feedbacks não lidos

#### 👤 Colaborador
- Visualiza apenas feedbacks recebidos
- Dashboard com média da equipe
- Lista de feedbacks não lidos

### 🎯 Funcionalidades Principais

- **Sistema de Login** com autenticação JWT
- **Gestão de Usuários** (CRUD completo)
- **Gestão de Setores e Cargos**
- **Sistema de Feedbacks** com notas de 0-10
- **Dashboards Interativos** com gráficos
- **Notificações** de feedbacks não lidos
- **Exportação CSV** com filtros avançados
- **Interface Responsiva** para desktop e mobile

## 🛠️ Tecnologias

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT para autenticação
- Bcrypt para hash de senhas
- CORS e Helmet para segurança

### Frontend
- React + TypeScript
- React Router para navegação
- Recharts para gráficos
- Lucide React para ícones
- Axios para requisições HTTP

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd feedback
```

### 2. Instale as dependências
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configure o banco de dados
```bash
# Crie um banco PostgreSQL chamado 'feedback360'
createdb feedback360

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Inicialize o banco de dados
```bash
# O banco será inicializado automaticamente na primeira execução
# ou execute manualmente:
node database/init.js
```

### 5. Execute o projeto
```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Ou execute separadamente:
# Backend
npm run server

# Frontend
cd client && npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feedback360
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=admin123
```

## 📊 Estrutura do Banco de Dados

- **setores**: Setores da empresa
- **cargos**: Cargos/funções
- **usuarios**: Usuários do sistema
- **equipe**: Relacionamento gestor-colaborador
- **feedbacks**: Feedbacks entre usuários
- **feedback_visualizacao**: Controle de leitura
- **login_auditoria**: Log de tentativas de login

## 🎨 Design System

### Paleta de Cores
- **Azul Escuro**: #0A2342 (primary)
- **Preto**: #000000
- **Marrom Claro**: RGB(125, 105, 94)
- **Background**: #0F172A
- **Surface**: #111827

### Componentes
- Cards com bordas arredondadas
- Botões com gradientes sutis
- Gráficos interativos
- Layout responsivo

## 🚀 Deploy

### Heroku
```bash
# Instale o Heroku CLI
# Configure as variáveis de ambiente no Heroku
# Faça o deploy
git push heroku main
```

### Docker
```bash
# Build da imagem
docker build -t feedback360 .

# Execute o container
docker run -p 5000:5000 feedback360
```

## 📱 Uso

1. **Login**: Use `admin@empresa.com` / `admin123`
2. **Criar Usuários**: Acesse "Usuários" (apenas admin)
3. **Configurar Equipes**: Defina gestores e colaboradores
4. **Criar Feedbacks**: Use a aba "Feedback"
5. **Visualizar Dashboards**: Métricas por perfil de usuário
6. **Exportar Dados**: Use a aba "Exportar CSV"

## 🔒 Segurança

- Senhas com hash bcrypt
- Autenticação JWT
- Rate limiting
- CORS configurado
- Validação de dados
- Soft delete para usuários

## 📈 Métricas

### Admin
- Média geral de todas as equipes
- Feedbacks por setor
- Tendência de notas
- Top usuários

### Gestor
- Média da equipe
- Feedbacks por colaborador
- Feedbacks não lidos

### Colaborador
- Média da equipe
- Seus feedbacks recebidos
- Contador de não lidos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para suporte, entre em contato através dos issues do GitHub ou email.

---

**Feedback360** - Sistema de Gestão de Feedbacks Corporativos
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
