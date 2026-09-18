'use client';

import React, { useState } from 'react';
import { createRaffleAction } from '@/app/actions';
import { calculateRaffleFinances, formatCurrency } from '@/lib/finance';
import Link from 'next/link';

export default function NewRafflePage() {
  const [costPrice, setCostPrice] = useState(1500);
  const [totalQuotas, setTotalQuotas] = useState(1000);
  const [quotaPrice, setQuotaPrice] = useState(3.50);
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
            Cadastre o produto, insira imagens no Supabase Storage e calcule o lucro real.
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
        <div className="space-y-4">
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

            {/* Input oculto/editável com a URL da imagem */}
            <input
              type="text"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Ou cole a URL direta da imagem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>

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
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
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
          🚀 Criar e Lançar Rifa na minharifabh
        </button>
      </form>
    </div>
  );
}
