'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/finance';
import Link from 'next/link';

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

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
    const interval = setInterval(fetchOrder, 3000); // Polling a cada 3s
    return () => clearInterval(interval);
  }, [params.id]);

  const handleCopyPix = () => {
    if (order?.mpPixCopiaECola) {
      navigator.clipboard.writeText(order.mpPixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    await fetch(`/api/simular-pagamento/${params.id}`, { method: 'POST' });
    await fetchOrder();
    setSimulating(false);
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-400">
        Carregando informações do pedido...
      </div>
    );
  }

  const isPaid = order.status === 'PAID';

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {isPaid ? (
        /* Tela de Sucesso Pós-Pagamento */
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black border border-emerald-500/30">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Pagamento Confirmado!</h1>
            <p className="text-xs text-slate-400">Seus números foram alocados com sucesso no sistema.</p>
          </div>

          {/* Números Alocados */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase text-amber-400 block">
              Seus Números da Sorte ({order.tickets?.length || 0} cotas)
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-2">
              {order.tickets?.map((t: any) => (
                <span
                  key={t.id}
                  className={`px-3 py-1.5 rounded-lg text-sm font-black border ${
                    t.isInstantWin
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-slate-900 text-slate-200 border-slate-700'
                  }`}
                >
                  #{String(t.number).padStart(4, '0')}
                  {t.isInstantWin && ' 🏆'}
                </span>
              ))}
            </div>

            {order.tickets?.some((t: any) => t.isInstantWin) && (
              <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg text-xs text-amber-300 font-bold">
                🎉 PARABÉNS! Você tirou um Bilhete Premiado Instantâneo! Entraremos em contato via WhatsApp.
              </div>
            )}
          </div>

          <Link href="/" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
            Voltar para as Rifas
          </Link>
        </div>
      ) : (
        /* Tela de Checkout PIX */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-2xl">
          <div className="space-y-1">
            <span className="bg-amber-400/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/20">
              Aguardando Pagamento PIX
            </span>
            <h1 className="text-xl font-bold text-white mt-2">{order.raffle?.title}</h1>
            <p className="text-xs text-slate-400">{order.quantity} cotas • Total: {formatCurrency(order.totalAmount)}</p>
          </div>

          {/* QR Code PIX */}
          <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
            {order.mpQrCode ? (
              <img src={`data:image/png;base64,${order.mpQrCode}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                QR CODE PIX
              </div>
            )}
          </div>

          {/* Copia e Cola Button */}
          <div className="space-y-3">
            <button
              onClick={handleCopyPix}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10"
            >
              {copied ? '✓ Código Pix Copiado!' : 'Copiar Código Pix Copia e Cola'}
            </button>

            {/* Simulação de Teste para dev */}
            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium py-2 rounded-lg text-xs transition-all border border-slate-700"
            >
              {simulating ? 'Aprovando...' : '⚡ Simular Aprovação PIX (Ambiente de Teste)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
