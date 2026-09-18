import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, calculateRaffleFinances } from '@/lib/finance';
import { logoutAdminAction } from '@/app/actions';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  let raffles: any[] = [];
  try {
    const { data } = await supabase
      .from('Raffle')
      .select('*, tickets:Ticket(id)')
      .order('createdAt', { ascending: false });
    raffles = data || [];
  } catch (e) {
    console.warn('Banco ainda inicializando');
  }

  // Métricas agregadas
  let totalGrossRevenue = 0;
  let totalMpFees = 0;
  let totalCosts = 0;

  raffles.forEach((r) => {
    const soldQuotas = r.tickets?.length || 0;
    const finances = calculateRaffleFinances({
      totalQuotas: soldQuotas,
      quotaPrice: r.quotaPrice,
      costPrice: r.costPrice,
      mpFeePercent: r.mpFeePercent,
    });

    totalGrossRevenue += finances.grossRevenue;
    totalMpFees += finances.mpFeeAmount;
    totalCosts += r.costPrice;
  });

  const totalNetProfit = totalGrossRevenue - totalMpFees - totalCosts;

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            ⚙️ Painel Administrativo <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">minharifabh</span>
          </h1>
          <p className="text-xs text-slate-400">Visão financeira em tempo real e gestão de campanhas</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/configuracoes"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-1.5"
          >
            🔑 Configurar APIs
          </Link>
          <Link
            href="/admin/rifas/nova"
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
          >
            + Criar Nova Rifa
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-3 py-2 rounded-2xl text-xs transition-all"
            >
              🚪 Sair
            </button>
          </form>
        </div>
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-1 backdrop-blur-xl">
          <span className="text-xs text-slate-400 font-semibold block">Receita Bruta</span>
          <span className="text-xl font-black text-white">{formatCurrency(totalGrossRevenue)}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-1 backdrop-blur-xl">
          <span className="text-xs text-slate-400 font-semibold block">Taxa Mercado Pago (0.99%)</span>
          <span className="text-xl font-black text-rose-400">-{formatCurrency(totalMpFees)}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-1 backdrop-blur-xl">
          <span className="text-xs text-slate-400 font-semibold block">Custo Total dos Prêmios</span>
          <span className="text-xl font-black text-amber-400">-{formatCurrency(totalCosts)}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-3xl space-y-1 backdrop-blur-xl shadow-lg shadow-emerald-500/5">
          <span className="text-xs text-emerald-400 font-extrabold block">Lucro Líquido Real</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(totalNetProfit)}</span>
        </div>
      </div>

      {/* Tabela de Rifas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-white">Todas as Rifas Cadastradas</h2>
          <span className="text-xs text-slate-400 font-bold">{raffles.length} rifas ativas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Cotas Vendidas</th>
                <th className="p-3">Valor Cota</th>
                <th className="p-3">Custo Produto</th>
                <th className="p-3">Taxa MP (0.99%)</th>
                <th className="p-3">Lucro Estimado</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {raffles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Nenhuma rifa cadastrada ainda. Clique em "+ Criar Nova Rifa" para iniciar.
                  </td>
                </tr>
              ) : (
                raffles.map((r) => {
                  const soldQuotas = r.tickets?.length || 0;
                  const fin = calculateRaffleFinances({
                    totalQuotas: r.totalQuotas,
                    quotaPrice: r.quotaPrice,
                    costPrice: r.costPrice,
                    mpFeePercent: r.mpFeePercent,
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold text-white">{r.title}</td>
                      <td className="p-3">{soldQuotas} / {r.totalQuotas}</td>
                      <td className="p-3">{formatCurrency(r.quotaPrice)}</td>
                      <td className="p-3">{formatCurrency(r.costPrice)}</td>
                      <td className="p-3 text-rose-400">{formatCurrency(fin.mpFeeAmount)}</td>
                      <td className="p-3 font-black text-emerald-400">{formatCurrency(fin.netProfit)}</td>
                      <td className="p-3 text-right">
                        <Link href={`/rifa/${r.slug}`} className="text-emerald-400 font-bold hover:underline">
                          Ver Rifa →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
