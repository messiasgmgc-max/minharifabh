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
  const [images, setImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '4/3'>('16/9');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const finances = calculateRaffleFinances({
    totalQuotas,
    quotaPrice,
    costPrice,
    mpFeePercent: 0.99,
  });

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const newUploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || `Erro ao enviar ${file.name}`);
        }

        if (data.url) {
          newUploadedUrls.push(data.url);
        }
      }

      setImages(prev => [...prev, ...newUploadedUrls]);
    } catch (err: any) {
      setUploadError(err.message || 'Falha no upload das fotos.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsCover = (index: number) => {
    setImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 py-2 sm:py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            🎁 Criar Nova Rifa
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre o prêmio com fotos, cotas, modo de escolha e lucro real.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
        >
          ← Voltar
        </Link>
      </div>

      <form action={createRaffleAction} className="bg-slate-900/90 border border-slate-800 rounded-2xl md:rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <input type="hidden" name="imageUrl" value={images[0] || ''} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        <div className="space-y-5">
          {/* Título */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Título do Produto / Prêmio</label>
            <input
              type="text"
              name="title"
              placeholder="Ex: iPhone 15 Pro Max 256GB Lacrado"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all font-medium"
            />
          </div>

          {/* Galeria de Fotos com Upload Múltiplo e Aspect Ratio (16:9 ou 4:3) */}
          <div className="space-y-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <label className="text-xs text-slate-300 font-black uppercase tracking-wider block">
                  📷 Fotos do Produto (Aceita Múltiplas Fotos)
                </label>
                <span className="text-[11px] text-slate-500">
                  Adicione uma ou mais imagens para criar a galeria/carrossel
                </span>
              </div>

              {/* Seletor de Formato 16:9 / 4:3 */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                <span className="text-slate-500 px-1">Formato:</span>
                <button
                  type="button"
                  onClick={() => setAspectRatio('16/9')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    aspectRatio === '16/9' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  16:9 (Widescreen)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('4/3')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    aspectRatio === '4/3' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4:3 (Padrão)
                </button>
              </div>
            </div>

            {/* Grid de Previews de Fotos */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border group bg-slate-900 ${
                      aspectRatio === '16/9' ? 'aspect-video' : 'aspect-[4/3]'
                    } ${idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'}`}
                  >
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                    {/* Badge Foto Principal */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                        ★ Capa Principal
                      </span>
                    )}

                    {/* Ações na foto */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsCover(idx)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-lg"
                        >
                          Tornar Capa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input de Upload de Fotos */}
            <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center space-y-2 bg-slate-900/50 transition-colors">
              <p className="text-xs text-slate-300 font-semibold">
                {uploading ? 'Enviando fotos para o Supabase Storage...' : 'Selecione uma ou mais fotos do celular/computador'}
              </p>
              <p className="text-[11px] text-slate-500">Formatos aceitos: JPG, PNG, WEBP (Comportadas em 16:9 ou 4:3)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleFilesUpload}
                disabled={uploading}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
              />
              {uploadError && <p className="text-xs font-bold text-rose-400">{uploadError}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Descrição Detalhada</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalhes sobre o produto, entrega e regra do sorteio..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all font-medium"
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
                  O cliente pode escolher números na grade OU gerar cotas automáticas.
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
                  Sistema sorteia as cotas automaticamente ao pagar.
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
                  O cliente é obrigado a selecionar os números na grade.
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Data Prevista do Sorteio</label>
            <input
              type="date"
              name="drawDate"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Calculadora Financeira de Lucro */}
        <div className="bg-slate-950 border border-emerald-500/20 p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-3">
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
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          🚀 Criar e Lançar Rifa na Rifa Milionária
        </button>
      </form>
    </div>
  );
}
