'use client';

import React, { useState } from 'react';
import { createRaffleAction } from '@/app/actions';
import { calculateRaffleFinances, formatCurrency } from '@/lib/finance';

export default function NewRafflePage() {
  const [costPrice, setCostPrice] = useState(1500);
  const [totalQuotas, setTotalQuotas] = useState(1000);
  const [quotaPrice, setQuotaPrice] = useState(3.50);

  const finances = calculateRaffleFinances({
    totalQuotas,
    quotaPrice,
    costPrice,
    mpFeePercent: 0.99,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white">Criar Nova Rifa</h1>
        <p className="text-xs text-slate-400">Cadastre o produto, cotas e valores com cálculo de lucro automático.</p>
      </div>

      <form action={createRaffleAction} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Título do Produto / Prêmio</label>
            <input
              type="text"
              name="title"
              placeholder="Ex: iPhone 15 Pro Max 256GB Lacrado"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">URL da Imagem</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Descrição</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalhes sobre o produto, entrega e regra do sorteio..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Valor de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Total de Cotas</label>
              <input
                type="number"
                name="totalQuotas"
                value={totalQuotas}
                onChange={(e) => setTotalQuotas(parseInt(e.target.value) || 0)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Valor por Cota (R$)</label>
              <input
                type="number"
                step="0.01"
                name="quotaPrice"
                value={quotaPrice}
                onChange={(e) => setQuotaPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Data do Sorteio</label>
            <input
              type="date"
              name="drawDate"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Simulador Financeiro em Tempo Real */}
        <div className="bg-slate-950 border border-amber-500/20 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold uppercase text-amber-400 block">📊 Calculadora de Lucro Automática</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Receita Bruta:</span>
              <span className="font-bold text-white">{formatCurrency(finances.grossRevenue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Taxa MP (0.99%):</span>
              <span className="font-bold text-rose-400">-{formatCurrency(finances.mpFeeAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Custo do Produto:</span>
              <span className="font-bold text-amber-400">-{formatCurrency(costPrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lucro Líquido Real:</span>
              <span className="font-black text-emerald-400 text-sm">{formatCurrency(finances.netProfit)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-4 rounded-xl text-sm uppercase tracking-wider transition-all"
        >
          Criar e Lançar Rifa
        </button>
      </form>
    </div>
  );
}
