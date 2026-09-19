import { supabase } from './supabase';

/**
 * Busca uma chave de configuração do Banco de Dados via Supabase SDK.
 * Se não existir no banco, faz fallback para process.env.
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('Setting')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[getSetting ${key}] Aviso Supabase:`, error.message);
    }

    if (data && typeof data.value === 'string' && data.value.trim() !== '') {
      return data.value.trim();
    }
  } catch (e) {
    console.warn(`[getSetting ${key}] Erro ao consultar banco:`, e);
  }
  return process.env[key] || defaultValue;
}

/**
 * Salva ou atualiza uma chave de configuração no Banco de Dados via Supabase.
 */
export async function saveSetting(key: string, value: string): Promise<void> {
  try {
    const val = (value || '').trim();
    const { error } = await supabase
      .from('Setting')
      .upsert({ key, value: val, updatedAt: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error(`Erro ao salvar setting ${key} no Supabase:`, error);
      throw error;
    }
  } catch (e) {
    console.error(`Erro ao salvar setting ${key}:`, e);
    throw e;
  }
}
