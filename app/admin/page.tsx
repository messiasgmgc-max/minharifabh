import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, calculateRaffleFinances } from '@/lib/finance';
import { logoutAdminAction, toggleRaffleStatusAction } from '@/app/actions';

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
    <div className="space-y-6 md:space-y-8 py-2 md:py-4">
      {/* Header do Painel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            ⚙️ Painel Administrativo <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Rifa Milionária</span>
          </h1>
          <p className="text-xs text-slate-400">Gestão de rifas, fotos e métricas financeiras</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            href="/admin/configuracoes"
            className="flex-1 md:flex-none text-center bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            🔑 APIs
          </Link>
          <Link
            href="/admin/rifas/nova"
            className="flex-1 md:flex-none text-center bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider active:scale-95"
          >
            + Nova Rifa
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-3 py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >
              🚪 Sair
            </button>
          </form>
        </div>
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-5 rounded-2xl md:rounded-3xl space-y-1">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold block">Receita Bruta</span>
          <span className="text-base sm:text-xl font-black text-white">{formatCurrency(totalGrossRevenue)}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-5 rounded-2xl md:rounded-3xl space-y-1">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold block">Taxa MP (0.99%)</span>
          <span className="text-base sm:text-xl font-black text-rose-400">-{formatCurrency(totalMpFees)}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-5 rounded-2xl md:rounded-3xl space-y-1">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold block">Custo Prêmios</span>
          <span className="text-base sm:text-xl font-black text-amber-400">-{formatCurrency(totalCosts)}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 sm:p-5 rounded-2xl md:rounded-3xl space-y-1 shadow-lg shadow-emerald-500/5">
          <span className="text-[11px] sm:text-xs text-emerald-400 font-extrabold block">Lucro Líquido</span>
          <span className="text-base sm:text-xl font-black text-emerald-400">{formatCurrency(totalNetProfit)}</span>
        </div>
      </div>

      {/* Gestão de Rifas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden space-y-4 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-sm md:text-base font-black text-white">Todas as Rifas Cadastradas</h2>
          <span className="text-xs text-slate-400 font-bold">{raffles.length} cadastradas</span>
        </div>

        {/* View Mobile Cards (Perfeito para gerenciar no celular) */}
        <div className="space-y-3 md:hidden">
          {raffles.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Nenhuma rifa cadastrada.</p>
          ) : (
            raffles.map((r) => {
              const soldQuotas = r.tickets?.length || 0;
              const isActive = r.status === 'ACTIVE';

              return (
                <div key={r.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={r.imageUrl} alt={r.title} className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800" />
                      <div>
                        <h3 className="font-bold text-white text-xs line-clamp-1">{r.title}</h3>
                        <span className="text-[10px] text-slate-400 block">{formatCurrency(r.quotaPrice)} / cota • {soldQuotas}/{r.totalQuotas} vendidas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    {/* Botão de Ativar / Desativar Rifa */}
                    <form action={toggleRaffleStatusAction}>
                      <input type="hidden" name="raffleId" value={r.id} />
                      <input type="hidden" name="currentStatus" value={r.status || 'ACTIVE'} />
                      <button
                        type="submit"
                        className={`text-[11px] font-black px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 active:scale-95 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {isActive ? '🟢 Ativa (Pausar)' : '🔴 Desativada (Ativar)'}
                      </button>
                    </form>

                    <Link
                      href={`/rifa/${r.slug}`}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      Ver Rifa →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Desktop Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Foto</th>
                <th className="p-3">Título</th>
                <th className="p-3">Status</th>
                <th className="p-3">Cotas Vendidas</th>
                <th className="p-3">Valor Cota</th>
                <th className="p-3">Lucro Estimado</th>
                <th className="p-3 text-right">Ações</th>
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
                  const isActive = r.status === 'ACTIVE';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <img src={r.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                      </td>
                      <td className="p-3 font-bold text-white max-w-xs truncate">{r.title}</td>
                      <td className="p-3">
                        {/* Botão de Ativar/Desativar */}
                        <form action={toggleRaffleStatusAction}>
                          <input type="hidden" name="raffleId" value={r.id} />
                          <input type="hidden" name="currentStatus" value={r.status || 'ACTIVE'} />
                          <button
                            type="submit"
                            className={`text-[11px] font-black px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            {isActive ? 'Ativa' : 'Desativada'}
                          </button>
                        </form>
                      </td>
                      <td className="p-3">{soldQuotas} / {r.totalQuotas}</td>
                      <td className="p-3">{formatCurrency(r.quotaPrice)}</td>
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
