'use client';

import React, { useState, useMemo } from 'react';
import { createCheckoutOrderAction } from '@/app/actions';
import { formatCurrency } from '@/lib/finance';

interface RaffleCheckoutFormProps {
  raffleId: string;
  quotaPrice: number;
  availableQuotas: number;
  totalQuotas?: number;
  selectionMode?: string; // 'AUTOMATIC' | 'MANUAL' | 'BOTH'
  takenNumbers?: number[];
}

const PAGE_SIZE = 100;

export function RaffleCheckoutForm({
  raffleId,
  quotaPrice,
  availableQuotas,
  totalQuotas = 1000,
  selectionMode = 'BOTH',
  takenNumbers = [],
}: RaffleCheckoutFormProps) {
  const initialMode = selectionMode === 'MANUAL' ? 'MANUAL' : 'RANDOM';
  const [activeTab, setActiveTab] = useState<'RANDOM' | 'MANUAL'>(initialMode);
  const [randomQuantity, setRandomQuantity] = useState(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<'ALL' | 'AVAILABLE' | 'SELECTED'>('ALL');

  const takenSet = useMemo(() => new Set(takenNumbers), [takenNumbers]);
  const selectedSet = useMemo(() => new Set(selectedNumbers), [selectedNumbers]);

  // Quantidade e total calculados
  const currentQuantity = activeTab === 'MANUAL' ? selectedNumbers.length : randomQuantity;
  const totalAmount = Number((currentQuantity * quotaPrice).toFixed(2));

  // Toggle número na seleção manual
  const toggleNumber = (num: number) => {
    if (takenSet.has(num)) return;
    if (selectedSet.has(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else {
      setSelectedNumbers(prev => [...prev, num].sort((a, b) => a - b));
    }
  };

  // Surpresinha: adiciona N números aleatórios disponíveis
  const handleSurprisePick = (count: number) => {
    const availablePool: number[] = [];
    for (let n = 1; n <= totalQuotas; n++) {
      if (!takenSet.has(n) && !selectedSet.has(n)) {
        availablePool.push(n);
      }
    }

    if (availablePool.length === 0) return;

    // Fisher-Yates shuffle
    for (let i = availablePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
    }

    const picked = availablePool.slice(0, count);
    setSelectedNumbers(prev => [...prev, ...picked].sort((a, b) => a - b));
  };

  const handleClearSelected = () => {
    setSelectedNumbers([]);
  };

  // Filtragem e paginação dos números para a grade
  const totalPages = Math.max(1, Math.ceil(totalQuotas / PAGE_SIZE));

  const numbersToDisplay = useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.trim().replace('#', '');
      const parsed = parseInt(term);
      const results: number[] = [];
      if (!isNaN(parsed) && parsed >= 1 && parsed <= totalQuotas) {
        results.push(parsed);
      }
      for (let n = 1; n <= totalQuotas; n++) {
        if (results.length >= 40) break;
        if (n !== parsed && String(n).includes(term)) {
          results.push(n);
        }
      }
      return results;
    }

    if (filterType === 'SELECTED') {
      return selectedNumbers;
    }

    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(totalQuotas, page * PAGE_SIZE);
    const nums: number[] = [];

    for (let n = start; n <= end; n++) {
      if (filterType === 'AVAILABLE' && takenSet.has(n)) continue;
      nums.push(n);
    }
    return nums;
  }, [searchTerm, filterType, page, totalQuotas, selectedNumbers, takenSet]);

  const padDigits = totalQuotas >= 10000 ? 5 : totalQuotas >= 1000 ? 4 : 3;

  return (
    <div className="bg-slate-900/95 border border-emerald-500/30 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 shadow-2xl backdrop-blur">
      {/* Badge de Urgência Mobile */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
        <span className="text-[11px] sm:text-xs font-black text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ⚡ ALTA PROCURA - GARANTA SUAS COTAS
        </span>
        <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-400 bg-slate-950 px-2 py-0.5 rounded-full border border-amber-400/20">
          PIX Instantâneo
        </span>
      </div>

      {/* Tabs de Modo de Escolha se permitido */}
      {selectionMode === 'BOTH' && (
        <div className="flex bg-slate-950 p-1 rounded-xl sm:rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('RANDOM')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
              activeTab === 'RANDOM'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎲</span> Aleatório (Rápido)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MANUAL')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
              activeTab === 'MANUAL'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔢</span> Escolher na Grade {selectedNumbers.length > 0 && `(${selectedNumbers.length})`}
          </button>
        </div>
      )}

      <form action={createCheckoutOrderAction} className="space-y-5">
        <input type="hidden" name="raffleId" value={raffleId} />
        <input
          type="hidden"
          name="quantity"
          value={currentQuantity}
        />
        <input
          type="hidden"
          name="selectedNumbers"
          value={activeTab === 'MANUAL' && selectedNumbers.length > 0 ? JSON.stringify(selectedNumbers) : ''}
        />

        {/* ABA: RANDOM / COTAS RÁPIDAS */}
        {activeTab === 'RANDOM' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                1. Selecione a Quantidade de Cotas
              </label>
              <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold">Geradas na hora</span>
            </div>

            {/* Presets de Cotas com toque ergonômico no celular */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[5, 10, 25, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setRandomQuantity(qty)}
                  className={`py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm border transition-all touch-manipulation active:scale-95 ${
                    randomQuantity === qty
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={randomQuantity}
                onChange={(e) => setRandomQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={availableQuotas}
                required
                className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-white text-xl sm:text-2xl font-black text-center focus:outline-none focus:border-emerald-400 shadow-inner font-mono"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs font-bold text-slate-500 uppercase">
                Cotas
              </span>
            </div>
          </div>
        )}

        {/* ABA: MANUAL / ESCOLHA NA GRADE */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  1. Escolha seus números
                </label>
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                  Toque nos números para selecionar
                </span>
              </div>

              {/* Botões de Surpresinha Touch-Friendly */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-0.5">Surpresinha:</span>
                {[1, 5, 10].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => handleSurprisePick(qty)}
                    className="bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-2.5 py-1.5 rounded-lg sm:rounded-xl transition-all active:scale-90"
                  >
                    +{qty}
                  </button>
                ))}
                {selectedNumbers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold px-2.5 py-1.5 rounded-lg sm:rounded-xl active:scale-90"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="🔍 Digite o número (ex: 77)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {!searchTerm && (
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] justify-center">
                  <button
                    type="button"
                    onClick={() => setFilterType('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterType === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('AVAILABLE')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterType === 'AVAILABLE' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Livres
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('SELECTED')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterType === 'SELECTED' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Marcados ({selectedNumbers.length})
                  </button>
                </div>
              )}
            </div>

            {/* Números Selecionados Badges */}
            {selectedNumbers.length > 0 && (
              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-emerald-400">
                    {selectedNumbers.length} {selectedNumbers.length === 1 ? 'Cota Escolhida' : 'Cotas Escolhidas'}:
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-0.5">
                  {selectedNumbers.map((num) => (
                    <span
                      key={num}
                      onClick={() => toggleNumber(num)}
                      className="bg-emerald-500 text-slate-950 font-mono font-black text-[11px] px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 active:scale-90"
                      title="Toque para remover"
                    >
                      #{String(num).padStart(padDigits, '0')}
                      <span className="text-[9px] opacity-70">✕</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grade de Números Mobile First (5 colunas no celular para toque perfeito) */}
            <div className="bg-slate-950 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 space-y-2.5">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-64 sm:max-h-72 overflow-y-auto p-0.5">
                {numbersToDisplay.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs text-slate-500">
                    Nenhum número disponível encontrado.
                  </div>
                ) : (
                  numbersToDisplay.map((num) => {
                    const isTaken = takenSet.has(num);
                    const isSelected = selectedSet.has(num);

                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isTaken}
                        onClick={() => toggleNumber(num)}
                        className={`h-11 rounded-xl font-mono text-xs font-bold border transition-all touch-manipulation active:scale-90 flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black scale-105 z-10'
                            : isTaken
                            ? 'bg-slate-900/30 text-slate-700 border-slate-900/60 cursor-not-allowed line-through'
                            : 'bg-slate-900 text-slate-200 border-slate-800/80 hover:border-emerald-500/50'
                        }`}
                      >
                        {String(num).padStart(padDigits, '0')}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Paginação da Grade */}
              {!searchTerm && filterType !== 'SELECTED' && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 font-bold active:scale-95"
                  >
                    ← Anterior
                  </button>
                  <span className="font-mono text-[11px]">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 font-bold active:scale-95"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumo do Total a Pagar */}
        <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase block">Total a Pagar:</span>
            <span className="text-[11px] text-slate-500">
              {currentQuantity} {currentQuantity === 1 ? 'cota' : 'cotas'} x {formatCurrency(quotaPrice)}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
        </div>

        {/* Micro-cadastro */}
        <div className="space-y-3.5 pt-3 border-t border-slate-800/80">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            2. Seus Dados para Contato
          </h4>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] sm:text-xs text-slate-400 font-bold block mb-1">Nome Completo</label>
              <input
                type="text"
                name="buyerName"
                autoComplete="name"
                placeholder="Nome e Sobrenome"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] sm:text-xs text-slate-400 font-bold block mb-1">WhatsApp</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  name="buyerPhone"
                  placeholder="(00) 00000-0000"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] sm:text-xs text-slate-400 font-bold block mb-1">E-mail</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  name="buyerEmail"
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Pagamento PIX Grande para Polegar */}
        <button
          type="submit"
          disabled={activeTab === 'MANUAL' && selectedNumbers.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-xl shadow-emerald-500/25 uppercase tracking-wider touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {activeTab === 'MANUAL' && selectedNumbers.length === 0
            ? 'SELECIONE AO MENOS 1 NÚMERO'
            : '🤑 GERAR PIX & PARTICIPAR ⚡'}
        </button>

        <p className="text-[10px] sm:text-[11px] text-center text-slate-500 flex items-center justify-center gap-1 pt-1">
          <span>🔒 Pagamento 100% Seguro Mercado Pago • Rifa Milionária</span>
        </p>
      </form>
    </div>
  );
}
