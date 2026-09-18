'use client';

import React, { useState } from 'react';
import { createRaffleAction } from '@/app/actions';
import { calculateRaffleFinances, formatCurrency } from '@/lib/finance';
import Link from 'next/link';

const QUOTA_PRESETS = [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000];

export default function NewRafflePage() {
  const [costPrice, setCostPrice] = useState(1500);
  const [totalQuotas, setTotalQuotas] = useState(1000);
  const [quotaPrice, setQuotaPrice] = useState(3.50);
  const [selectionMode, setSelectionMode] = useState<'BOTH' | 'MANUAL' | 'AUTOMATIC'>('BOTH');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const finances = calculateRaffleFinances({
    totalQuotas,
    quotaPrice,
    costPrice,
    mpFeePercent: 0.99,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao enviar imagem.');
      }

      setImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Falha no upload para o Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🎁 Criar Nova Rifa
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre o prêmio, configure a quantidade de cotas, modo de escolha e calcule seu lucro real.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
        >
          ← Voltar
        </Link>
      </div>

      <form action={createRaffleAction} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="space-y-5">
          {/* Título */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Título do Produto / Prêmio</label>
            <input
              type="text"
              name="title"
              placeholder="Ex: iPhone 15 Pro Max 256GB Lacrado"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all font-medium"
            />
          </div>

          {/* Campo de Upload Supabase Storage */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold block">
              Imagem do Produto (Supabase Storage)
            </label>
            
            <div className="bg-slate-950 border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center space-y-3 transition-colors">
              {imageUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      🗑 Remover / Trocar Imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">📷</div>
                  <p className="text-xs text-slate-300 font-semibold">
                    {uploading ? 'Enviando para o Supabase Storage...' : 'Selecione uma imagem para anexar'}
                  </p>
                  <p className="text-[11px] text-slate-500">PNG, JPG ou WEBP (Upload automático)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
                  />
                </div>
              )}

              {uploadError && (
                <p className="text-xs font-bold text-rose-400">{uploadError}</p>
              )}
            </div>

            <input
              type="text"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Ou cole a URL direta da imagem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Descrição Detalhada</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalhes sobre o produto, entrega e regra do sorteio..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all font-medium"
            />
          </div>

          {/* Quantidade Total de Cotas (Com Botões Rápidos) */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs text-emerald-400 font-black uppercase tracking-wider block">
                🎯 Quantidade Total de Cotas / Rifas
              </label>
              <span className="text-xs text-slate-400 font-mono font-bold">
                {totalQuotas.toLocaleString('pt-BR')} números (0001 até {String(totalQuotas).padStart(4, '0')})
              </span>
            </div>

            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-2">
              {QUOTA_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTotalQuotas(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    totalQuotas === preset
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {preset >= 1000000
                    ? `${preset / 1000000}M`
                    : preset >= 1000
                    ? `${preset / 1000}k`
                    : preset} cotas
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                name="totalQuotas"
                value={totalQuotas}
                onChange={(e) => setTotalQuotas(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">
                Cotas Totais
              </span>
            </div>
          </div>

          {/* Modo de Escolha de Números */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <label className="text-xs text-amber-400 font-black uppercase tracking-wider block">
              🎲 Modo de Escolha dos Números pelo Cliente
            </label>

            <input type="hidden" name="selectionMode" value={selectionMode} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectionMode('BOTH')}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1 ${
                  selectionMode === 'BOTH'
                    ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-emerald-400">
                  <span>🔀</span> Ambos (Híbrido)
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  O cliente pode escolher números específicos na grade OU gerar aleatoriamente.
                </p>
                <span className="text-[10px] text-emerald-300 font-bold mt-1">★ Recomendado</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMode('AUTOMATIC')}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1 ${
                  selectionMode === 'AUTOMATIC'
                    ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-teal-400">
                  <span>🎲</span> Apenas Aleatório
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Sistema sorteia as cotas automaticamente ao pagar. Mais rápido para rifas grandes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMode('MANUAL')}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1 ${
                  selectionMode === 'MANUAL'
                    ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-400">
                  <span>🔢</span> Apenas Escolha Manual
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  O cliente é obrigado a selecionar os números que deseja na grade interativa.
                </p>
              </button>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Valor de Custo do Prêmio (R$)</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Data Prevista do Sorteio</label>
            <input
              type="date"
              name="drawDate"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Calculadora Financeira de Lucro */}
        <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
          <span className="text-xs font-bold uppercase text-emerald-400 block tracking-wider">
            📊 Simulação de Rentabilidade & Taxas
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Receita Bruta:</span>
              <span className="font-bold text-white text-sm">{formatCurrency(finances.grossRevenue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Taxa MP (0.99%):</span>
              <span className="font-bold text-rose-400 text-sm">-{formatCurrency(finances.mpFeeAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Custo do Produto:</span>
              <span className="font-bold text-amber-400 text-sm">-{formatCurrency(costPrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lucro Líquido Real:</span>
              <span className="font-black text-emerald-400 text-base">{formatCurrency(finances.netProfit)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          🚀 Criar e Lançar Rifa na Rifa Milionária
        </button>
      </form>
    </div>
  );
}
