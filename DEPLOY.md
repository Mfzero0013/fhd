# 🚀 Guia de Deploy - Feedback360

Este guia te ajudará a hospedar o Feedback360 no Supabase + Render.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Render](https://render.com)
- Git configurado

## 🗄️ 1. Configurar Supabase

### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Nome do projeto: `feedback360`
5. Senha do banco: escolha uma senha forte
6. Região: escolha a mais próxima do Brasil
7. Clique em "Create new project"

### 1.2 Configurar Banco de Dados
1. No painel do Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-schema.sql`
3. Cole no editor e clique em **Run**
4. Aguarde a execução (pode demorar alguns minutos)

### 1.3 Obter Credenciais
1. Vá para **Settings** > **API**
2. Copie:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)

## 🌐 2. Configurar Render

### 2.1 Preparar Repositório
```bash
# Se ainda não fez, inicialize o git
git init
git add .
git commit -m "Initial commit"

# Crie um repositório no GitHub
# Conecte seu repositório local ao GitHub
git remote add origin https://github.com/seu-usuario/feedback360.git
git push -u origin main
```

### 2.2 Deploy do Backend
1. Acesse [render.com](https://render.com)
2. Clique em **New** > **Web Service**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `feedback360-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Em **Environment Variables**, adicione:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   JWT_SECRET=uma_chave_jwt_muito_segura_e_longa
   ADMIN_EMAIL=admin@empresa.com
   ADMIN_PASSWORD=admin123
   ```

6. Clique em **Create Web Service**

### 2.3 Deploy do Frontend
1. No Render, clique em **New** > **Static Site**
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `feedback360-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Plan**: `Free`

4. Em **Environment Variables**, adicione:
   ```
   REACT_APP_API_URL=https://feedback360-backend.onrender.com
   ```

5. Clique em **Create Static Site**

## 🔧 3. Configurações Adicionais

### 3.1 CORS no Supabase
1. No Supabase, vá para **Settings** > **API**
2. Em **CORS**, adicione:
   - `https://feedback360-frontend.onrender.com`
   - `http://localhost:3000` (para desenvolvimento)

### 3.2 Configurar Domínio Personalizado (Opcional)
1. No Render, vá para as configurações do seu serviço
2. Em **Custom Domains**, adicione seu domínio
3. Configure o DNS conforme instruções

## 🧪 4. Testar o Deploy

### 4.1 Verificar Backend
- Acesse: `https://feedback360-backend.onrender.com/api/health`
- Deve retornar: `{"status":"OK","timestamp":"..."}`

### 4.2 Verificar Frontend
- Acesse: `https://feedback360-frontend.onrender.com`
- Deve carregar a tela de login

### 4.3 Testar Login
- Email: `admin@empresa.com`
- Senha: `admin123`

## 🔄 5. Atualizações

Para atualizar o sistema:
```bash
git add .
git commit -m "Descrição da atualização"
git push origin main
```

O Render fará o deploy automaticamente.

## 🐛 6. Troubleshooting

### Problema: Backend não conecta ao Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o SQL foi executado no Supabase
- Verifique os logs no Render

### Problema: Frontend não carrega
- Verifique se o REACT_APP_API_URL está correto
- Confirme se o backend está rodando
- Verifique os logs no Render

### Problema: CORS Error
- Adicione a URL do frontend nas configurações de CORS do Supabase
- Verifique se as URLs estão corretas

## 📊 7. Monitoramento

### Render Dashboard
- Acesse o dashboard do Render para ver logs e métricas
- Monitore o uso de recursos

### Supabase Dashboard
- Acesse o dashboard do Supabase para ver dados e logs
- Monitore queries e performance

## 🔒 8. Segurança

### Produção
- Use senhas fortes para JWT_SECRET
- Configure HTTPS (já incluído no Render)
- Monitore logs de acesso
- Configure backup do banco no Supabase

### Desenvolvimento
- Use variáveis de ambiente locais
- Não commite credenciais no Git
- Use .env.local para desenvolvimento

## 📈 9. Escalabilidade

### Render
- **Free**: 750 horas/mês, sleep após 15min inativo
- **Starter**: $7/mês, sempre online
- **Standard**: $25/mês, melhor performance

### Supabase
- **Free**: 500MB banco, 2GB bandwidth
- **Pro**: $25/mês, 8GB banco, 250GB bandwidth

## 🆘 10. Suporte

- **Render**: [docs.render.com](https://docs.render.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: Abra uma issue no GitHub

---

**🎉 Parabéns! Seu Feedback360 está online!**

Acesse: `https://feedback360-frontend.onrender.com`
