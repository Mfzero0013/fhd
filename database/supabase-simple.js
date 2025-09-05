<<<<<<< HEAD
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL e SUPABASE_ANON_KEY não configurados. Usando dados mock.');
  // Retornar um cliente mock para desenvolvimento
  const mockSupabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      eq: function() { return this; },
      limit: function() { return this; },
      single: function() { return this; }
    }),
    rpc: () => ({ data: null, error: null })
  };
  
  const mockInitDatabase = async () => {
    console.log('Modo mock ativado - configure SUPABASE_URL e SUPABASE_ANON_KEY para usar Supabase real');
    return true;
  };
  
  module.exports = { supabase: mockSupabase, initDatabase: mockInitDatabase };
  return;
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para inicializar o banco de dados
async function initDatabase() {
  try {
    console.log('Conectando ao Supabase...');
    
    // Verificar conexão
    const { data, error } = await supabase
      .from('setores')
      .select('count')
      .limit(1);

    if (error) {
      console.log('Erro ao conectar ao Supabase:', error.message);
      console.log('Certifique-se de que:');
      console.log('1. O projeto Supabase está criado');
      console.log('2. As tabelas foram criadas no SQL Editor');
      console.log('3. As variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão corretas');
      return false;
    }

    console.log('Conectado ao Supabase com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}

module.exports = { supabase, initDatabase };
=======
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL e SUPABASE_ANON_KEY não configurados. Usando dados mock.');
  // Retornar um cliente mock para desenvolvimento
  const mockSupabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      eq: function() { return this; },
      limit: function() { return this; },
      single: function() { return this; }
    }),
    rpc: () => ({ data: null, error: null })
  };
  
  const mockInitDatabase = async () => {
    console.log('Modo mock ativado - configure SUPABASE_URL e SUPABASE_ANON_KEY para usar Supabase real');
    return true;
  };
  
  module.exports = { supabase: mockSupabase, initDatabase: mockInitDatabase };
  return;
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para inicializar o banco de dados
async function initDatabase() {
  try {
    console.log('Conectando ao Supabase...');
    
    // Verificar conexão
    const { data, error } = await supabase
      .from('setores')
      .select('count')
      .limit(1);

    if (error) {
      console.log('Erro ao conectar ao Supabase:', error.message);
      console.log('Certifique-se de que:');
      console.log('1. O projeto Supabase está criado');
      console.log('2. As tabelas foram criadas no SQL Editor');
      console.log('3. As variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão corretas');
      return false;
    }

    console.log('Conectado ao Supabase com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}

module.exports = { supabase, initDatabase };
>>>>>>> 3fe575445e2dba262a059926ff165f8a8708665f
