import { getSetting } from '@/lib/settings';
import { saveSettingsAction } from '@/app/actions';

export const revalidate = 0;

export default async function SettingsAdminPage({ searchParams }: { searchParams: { saved?: string } }) {
  const mpAccessToken = await getSetting('MERCADOPAGO_ACCESS_TOKEN');
  const mpPublicKey = await getSetting('MERCADOPAGO_PUBLIC_KEY');
  const mpWebhookSecret = await getSetting('MERCADOPAGO_WEBHOOK_SECRET');
  
  const supabaseUrl = await getSetting('NEXT_PUBLIC_SUPABASE_URL', 'https://ijwqphjbqpmgybmmqxsu.supabase.co');
  const supabaseAnonKey = await getSetting('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_xxxxxxxxxxxxxxxxxxxx');
  const supabaseServiceKey = await getSetting('SUPABASE_SERVICE_ROLE_KEY', 'sb_secret_xxxxxxxxxxxxxxxxxxxx');
  const adminPassword = await getSetting('ADMIN_PASSWORD', 'lucas191215');

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          🔑 Configurações de APIs & Chaves (Sem Redeploy)
        </h1>
        <p className="text-xs text-slate-400">
          Altere suas chaves do Mercado Pago e Supabase a qualquer momento. Elas são salvas diretamente no banco de dados.
        </p>
      </div>

      {searchParams?.saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs font-bold text-emerald-400">
          ✓ Configurações salvas no banco de dados com sucesso!
        </div>
      )}

      <form action={saveSettingsAction} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            💳 Mercado Pago API Credentials
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Access Token (MERCADOPAGO_ACCESS_TOKEN)</label>
              <input
                type="password"
                name="MERCADOPAGO_ACCESS_TOKEN"
                defaultValue={mpAccessToken}
                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Public Key (MERCADOPAGO_PUBLIC_KEY)</label>
              <input
                type="text"
                name="MERCADOPAGO_PUBLIC_KEY"
                defaultValue={mpPublicKey}
                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Mercado Pago Webhook Secret (MERCADOPAGO_WEBHOOK_SECRET)</label>
              <input
                type="password"
                name="MERCADOPAGO_WEBHOOK_SECRET"
                defaultValue={mpWebhookSecret}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            ⚡ Supabase API & Auth Credentials
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)</label>
              <input
                type="text"
                name="NEXT_PUBLIC_SUPABASE_URL"
                defaultValue={supabaseUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase Publishable/Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</label>
              <input
                type="text"
                name="NEXT_PUBLIC_SUPABASE_ANON_KEY"
                defaultValue={supabaseAnonKey}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Supabase Secret Key (SUPABASE_SERVICE_ROLE_KEY)</label>
              <input
                type="password"
                name="SUPABASE_SERVICE_ROLE_KEY"
                defaultValue={supabaseServiceKey}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            🔐 Senha do Painel Administrativo
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Senha de Acesso (ADMIN_PASSWORD)</label>
            <input
              type="text"
              name="ADMIN_PASSWORD"
              defaultValue={adminPassword}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
        >
          💾 Salvar Configurações no Banco de Dados
        </button>
      </form>
    </div>
  );
}
