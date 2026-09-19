'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency, formatTicketNumber } from '@/lib/finance';
import Link from 'next/link';

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/pedidos/${params.id}/status`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 2500); // Polling a cada 2.5s no mobile
    return () => clearInterval(interval);
  }, [params.id]);

  // Contador regressivo de 5 minutos
  useEffect(() => {
    if (!order || order.status !== 'PENDING' || !order.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(order.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [order?.expiresAt, order?.status]);

  const handleCopyPix = () => {
    if (order?.mpPixCopiaECola) {
      navigator.clipboard.writeText(order.mpPixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Carregando seu pedido PIX...</p>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';
  const isExpired = order.status === 'EXPIRED' || (timeLeft !== null && timeLeft <= 0 && !isPaid);

  let selectedNumbersList: number[] = [];
  if (order.selectedNumbers) {
    try {
      const parsed = typeof order.selectedNumbers === 'string'
        ? JSON.parse(order.selectedNumbers)
        : order.selectedNumbers;
      if (Array.isArray(parsed)) {
        selectedNumbersList = parsed;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-6 py-2 sm:py-6">
      {isPaid ? (
        /* Tela de Sucesso Mobile Pós-Pagamento */
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl md:rounded-3xl p-5 sm:p-8 space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-500/30 animate-bounce">
            ✓
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white">Pagamento Confirmado!</h1>
            <p className="text-xs text-slate-400">Suas cotas foram registradas com sucesso no sistema.</p>
          </div>

          {/* Números Alocados */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-black uppercase text-amber-400 block tracking-wider">
              Seus Números da Sorte ({order.tickets?.length || 0} cotas)
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center max-h-48 overflow-y-auto p-1">
              {order.tickets?.map((t: any) => (
                <span
                  key={t.id}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black border font-mono ${
                    t.isInstantWin
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse shadow-lg'
                      : 'bg-slate-900 text-slate-100 border-slate-700'
                  }`}
                >
                  #{formatTicketNumber(t.number, order?.raffle?.totalQuotas)}
                  {t.isInstantWin && ' 🏆'}
                </span>
              ))}
            </div>

            {order.tickets?.some((t: any) => t.isInstantWin) && (
              <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-300 font-bold">
                🎉 PARABÉNS! Você tirou um Bilhete Premiado Instantâneo! Entraremos em contato via WhatsApp.
              </div>
            )}
          </div>

          <Link
            href="/"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            Voltar para os Sorteios
          </Link>
        </div>
      ) : isExpired ? (
        /* Tela de Pedido Expirado */
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-rose-500/30">
            ⏱️
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white">Pedido Expirado</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              O prazo de 5 minutos para pagamento via PIX expirou. As cotas reservadas foram liberadas para outros compradores.
            </p>
          </div>

          <Link
            href={order.raffle?.slug ? `/rifa/${order.raffle.slug}` : '/'}
            className="block w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            🔄 Fazer Novo Pedido
          </Link>
        </div>
      ) : (
        /* Tela de Checkout PIX Ativo */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 text-center shadow-2xl">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 text-[11px] font-black px-3 py-1 rounded-full border border-amber-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Aguardando PIX
              </span>
              {timeLeft !== null && (
                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-rose-500/20">
                  ⏱️ Expira em {formatTimer(timeLeft)}
                </span>
              )}
            </div>
            
            <h1 className="text-lg sm:text-xl font-black text-white mt-1 line-clamp-1">{order.raffle?.title}</h1>
            <p className="text-xs text-slate-400">{order.quantity} cotas • Total: <strong className="text-emerald-400">{formatCurrency(order.totalAmount)}</strong></p>
          </div>

          {/* Botão Copiar Código Pix em Destaque no Topo para Mobile */}
          <div className="space-y-2">
            <button
              onClick={handleCopyPix}
              className={`w-full font-black py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 touch-manipulation flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {copied ? (
                <>
                  <span className="text-base">✓</span> CÓDIGO PIX COPIADO!
                </>
              ) : (
                <>
                  <span className="text-base">📋</span> COPIAR CÓDIGO PIX (COPIA E COLA)
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500">Toque no botão acima para copiar e cole no app do seu banco</p>
          </div>

          {/* QR Code PIX Centralizado e Nítido */}
          <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl mx-auto border border-slate-700">
            {order.mpQrCode ? (
              <img
                src={`data:image/png;base64,${order.mpQrCode}`}
                alt="QR Code PIX Mercado Pago"
                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain"
              />
            ) : order.mpPixCopiaECola ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(order.mpPixCopiaECola)}`}
                alt="QR Code PIX"
                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain"
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold">
                Carregando QR Code...
              </div>
            )}
          </div>

          {/* Passo a Passo Mobile */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
            <span className="text-emerald-400 font-black block text-[11px] uppercase tracking-wider">
              📲 Como Pagar pelo Celular:
            </span>
            <ol className="space-y-1.5 text-slate-300 text-[11px] list-decimal list-inside font-medium">
              <li>Toque no botão <strong className="text-amber-300">"Copiar Código PIX"</strong> acima</li>
              <li>Abra o aplicativo do seu banco (Nubank, Inter, Caixa, Itaú, etc.)</li>
              <li>Vá na opção <strong className="text-amber-300">PIX Copia e Cola</strong></li>
              <li>Cole o código e confirme o pagamento</li>
              <li>Esta tela atualizará automaticamente em segundos assim que pago!</li>
            </ol>
          </div>

          {/* Se escolheu números manuais */}
          {selectedNumbersList.length > 0 && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Cotas Selecionadas ({selectedNumbersList.length}):
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {selectedNumbersList.map((num) => (
                  <span key={num} className="bg-slate-900 text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-800 font-bold">
                    #{String(num).padStart(4, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
