import { supabase } from './supabase';

/**
 * Busca uma chave de configuração do Banco de Dados via Supabase SDK.
 * Se não existir no banco, faz fallback para process.env.
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const { data } = await supabase
      .from('Setting')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (data && data.value) {
      return data.value;
    }
  } catch (e) {
    // Silencioso se banco estiver inicializando
  }
  return process.env[key] || defaultValue;
}

/**
 * Salva ou atualiza uma chave de configuração no Banco de Dados via Supabase.
 */
export async function saveSetting(key: string, value: string): Promise<void> {
  try {
    await supabase
      .from('Setting')
      .upsert({ key, value, updatedAt: new Date().toISOString() }, { onConflict: 'key' });
  } catch (e) {
    console.error(`Erro ao salvar setting ${key}:`, e);
  }
}
