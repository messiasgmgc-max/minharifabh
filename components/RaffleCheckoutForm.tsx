'use client';

import React, { useState } from 'react';
import { createCheckoutOrderAction } from '@/app/actions';
import { formatCurrency } from '@/lib/finance';

interface RaffleCheckoutFormProps {
  raffleId: string;
  quotaPrice: number;
  availableQuotas: number;
}

export function RaffleCheckoutForm({ raffleId, quotaPrice, availableQuotas }: RaffleCheckoutFormProps) {
  const [quantity, setQuantity] = useState(10);
  const totalAmount = Number((quantity * quotaPrice).toFixed(2));

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur">
      {/* Badge de Urgência & Gatilho Mental */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ⚡ ALTA DEMANDA - GARANTA SEUS NÚMEROS AGORA
        </span>
        <span className="text-[11px] font-extrabold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-full border border-amber-400/20">
          PIX Instantâneo
        </span>
      </div>

      <form action={createCheckoutOrderAction} className="space-y-6">
        <input type="hidden" name="raffleId" value={raffleId} />

        {/* Seletor de Cotas Rápidas */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400 block tracking-wider">
            1. Selecione a Quantidade de Cotas
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[5, 10, 25, 50, 100].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className={`py-3 rounded-2xl font-black text-xs border transition-all duration-200 ${
                  quantity === qty
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-slate-950 hover:bg-emerald-500/20 text-slate-200 border-slate-800'
                }`}
              >
                +{qty}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={availableQuotas}
              required
              className="w-full bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 text-white text-2xl font-black text-center focus:outline-none focus:border-emerald-400 shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">
              Cotas
            </span>
          </div>
        </div>

        {/* Valor Total Calculado */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold uppercase">Total a Pagar:</span>
          <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
        </div>

        {/* Micro-cadastro */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            2. Dados de Contato (Para entrega do prêmio)
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Nome Completo</label>
              <input
                type="text"
                name="buyerName"
                placeholder="Digite seu nome completo"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  name="buyerPhone"
                  placeholder="(31) 99999-9999"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">E-mail</label>
                <input
                  type="email"
                  name="buyerEmail"
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Chamada para Ação com Gatilho */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-wider transform active:scale-95"
        >
          🤑 GERAR PIX & REVELAR MEUS NÚMEROS ⚡
        </button>

        <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
          <span>🔒 Pagamento 100% Protegido via Mercado Pago</span>
        </p>
      </form>
    </div>
  );
}
