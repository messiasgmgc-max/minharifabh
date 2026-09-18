import { getSetting } from '@/lib/settings';
import { saveSettingsAction, logoutAdminAction } from '@/app/actions';

export const revalidate = 0;

export default async function SettingsAdminPage({
  searchParams,
}: {
  searchParams?: { saved?: string };
}) {
  let mpAccessToken = '';
  let mpPublicKey = '';
  let mpWebhookSecret = '';
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijwqphjbqpmgybmmqxsu.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  let adminPassword = 'lucas191215';

  try {
    mpAccessToken = await getSetting('MERCADOPAGO_ACCESS_TOKEN');
    mpPublicKey = await getSetting('MERCADOPAGO_PUBLIC_KEY');
    mpWebhookSecret = await getSetting('MERCADOPAGO_WEBHOOK_SECRET');
    supabaseUrl = await getSetting('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
    supabaseAnonKey = await getSetting('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);
    supabaseServiceKey = await getSetting('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey);
    adminPassword = await getSetting('ADMIN_PASSWORD', 'lucas191215');
  } catch (e) {
    console.warn('Erro ao carregar configurações do banco:', e);
  }

  const isSaved = searchParams?.saved === 'true';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🔑 Configurações de APIs & Senhas
          </h1>
          <p className="text-xs text-slate-400">
            Altere suas chaves do Mercado Pago, Supabase e a senha do painel a qualquer momento.
          </p>
        </div>

        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-2xl transition-all"
          >
            🚪 Sair do Admin
          </button>
        </form>
      </div>

      {isSaved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-lg">
          <span>✓</span> Configurações salvas no banco de dados com sucesso!
        </div>
      )}

      <form action={saveSettingsAction} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-xl">
        {/* Mercado Pago API */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
            💳 Credenciais Mercado Pago PIX
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Access Token (MERCADOPAGO_ACCESS_TOKEN)</label>
              <input
                type="password"
                name="MERCADOPAGO_ACCESS_TOKEN"
                defaultValue={mpAccessToken}
                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Public Key (MERCADOPAGO_PUBLIC_KEY)</label>
              <input
                type="text"
                name="MERCADOPAGO_PUBLIC_KEY"
                defaultValue={mpPublicKey}
                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Webhook Secret (MERCADOPAGO_WEBHOOK_SECRET)</label>
              <input
                type="password"
                name="MERCADOPAGO_WEBHOOK_SECRET"
                defaultValue={mpWebhookSecret}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* Supabase API */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
            ⚡ Credenciais Supabase Database & Storage
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase URL (NEXT_PUBLIC_SUPABASE_URL)</label>
              <input
                type="text"
                name="NEXT_PUBLIC_SUPABASE_URL"
                defaultValue={supabaseUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase Publishable/Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</label>
              <input
                type="text"
                name="NEXT_PUBLIC_SUPABASE_ANON_KEY"
                defaultValue={supabaseAnonKey}
                placeholder="sb_publishable_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase Secret Key (SUPABASE_SERVICE_ROLE_KEY)</label>
              <input
                type="password"
                name="SUPABASE_SERVICE_ROLE_KEY"
                defaultValue={supabaseServiceKey}
                placeholder="sb_secret_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* Admin Password */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
            🔐 Senha do Painel Administrativo
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Senha de Acesso Admin (ADMIN_PASSWORD)</label>
            <input
              type="text"
              name="ADMIN_PASSWORD"
              defaultValue={adminPassword}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          💾 Salvar Configurações no Banco de Dados
        </button>
      </form>
    </div>
  );
}
