import { prisma } from './prisma';

/**
 * Busca uma chave de configuração do Banco de Dados.
 * Se não existir no banco, faz fallback para process.env.
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (e) {
    // Silencioso se banco estiver inicializando
  }
  return process.env[key] || defaultValue;
}

/**
 * Salva ou atualiza uma chave de configuração no Banco de Dados.
 */
export async function saveSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
