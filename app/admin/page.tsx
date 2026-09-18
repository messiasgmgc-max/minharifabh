import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, calculateRaffleFinances } from '@/lib/finance';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const raffles = await prisma.raffle.findMany({
    include: {
      orders: { where: { status: 'PAID' } },
      tickets: true,
    }
  });

  // Métricas agregadas
  let totalGrossRevenue = 0;
  let totalMpFees = 0;
  let totalCosts = 0;

  raffles.forEach((r) => {
    const soldQuotas = r.tickets.length;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Painel Administrativo</h1>
          <p className="text-xs text-slate-400">Visão financeira e controle de rifas</p>
        </div>

        <Link href="/admin/rifas/nova" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10">
          + Nova Rifa
        </Link>
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Receita Bruta</span>
          <span className="text-xl font-black text-white">{formatCurrency(totalGrossRevenue)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Taxa Mercado Pago (0.99%)</span>
          <span className="text-xl font-black text-rose-400">-{formatCurrency(totalMpFees)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Custo Total de Prêmios</span>
          <span className="text-xl font-black text-amber-400">-{formatCurrency(totalCosts)}</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-xl space-y-1">
          <span className="text-xs text-emerald-400 font-semibold block">Lucro Líquido Real</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(totalNetProfit)}</span>
        </div>
      </div>

      {/* Tabela de Rifas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
        <h2 className="text-base font-bold text-white">Todas as Rifas</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Cotas Vendedas</th>
                <th className="p-3">Valor Cota</th>
                <th className="p-3">Custo Produto</th>
                <th className="p-3">Taxa MP (0.99%)</th>
                <th className="p-3">Lucro Estimado</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {raffles.map((r) => {
                const soldQuotas = r.tickets.length;
                const fin = calculateRaffleFinances({
                  totalQuotas: r.totalQuotas,
                  quotaPrice: r.quotaPrice,
                  costPrice: r.costPrice,
                  mpFeePercent: r.mpFeePercent,
                });

                return (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{r.title}</td>
                    <td className="p-3">{soldQuotas} / {r.totalQuotas}</td>
                    <td className="p-3">{formatCurrency(r.quotaPrice)}</td>
                    <td className="p-3">{formatCurrency(r.costPrice)}</td>
                    <td className="p-3 text-rose-400">{formatCurrency(fin.mpFeeAmount)}</td>
                    <td className="p-3 font-black text-emerald-400">{formatCurrency(fin.netProfit)}</td>
                    <td className="p-3 text-right">
                      <Link href={`/rifa/${r.slug}`} className="text-amber-400 font-bold hover:underline">
                        Ver Rifa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
