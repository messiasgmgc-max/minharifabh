'use server';

import { prisma } from '@/lib/prisma';
import { calculateRaffleFinances } from '@/lib/finance';
import { createPixPayment } from '@/lib/mercadopago';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRaffleAction(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800';
  const costPrice = parseFloat(formData.get('costPrice') as string) || 0;
  const totalQuotas = parseInt(formData.get('totalQuotas') as string) || 1000;
  const quotaPrice = parseFloat(formData.get('quotaPrice') as string) || 1.0;
  const drawDateStr = formData.get('drawDate') as string;
  const hasInstantPrizes = formData.get('hasInstantPrizes') === 'on';
  const instantPrizesCount = parseInt(formData.get('instantPrizesCount') as string) || 0;
  const instantPrizesDetails = formData.get('instantPrizesDetails') as string || '[]';

  const slug = title.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  const raffle = await prisma.raffle.create({
    data: {
      title,
      slug,
      description,
      imageUrl,
      costPrice,
      totalQuotas,
      quotaPrice,
      mpFeePercent: 0.99,
      drawDate: new Date(drawDateStr || Date.now() + 7 * 24 * 60 * 60 * 1000),
      hasInstantPrizes,
      instantPrizesCount,
      instantPrizesDetails,
    }
  });

  revalidatePath('/');
  revalidatePath('/admin');
  redirect(`/rifa/${raffle.slug}`);
}

export async function createCheckoutOrderAction(formData: FormData) {
  const raffleId = formData.get('raffleId') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const buyerName = formData.get('buyerName') as string;
  const buyerPhone = formData.get('buyerPhone') as string;
  const buyerEmail = formData.get('buyerEmail') as string;

  const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle) throw new Error('Rifa não encontrada');

  const totalAmount = Number((quantity * raffle.quotaPrice).toFixed(2));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos para pagar

  const order = await prisma.order.create({
    data: {
      raffleId: raffle.id,
      buyerName,
      buyerPhone,
      buyerEmail,
      quantity,
      totalAmount,
      expiresAt,
    }
  });

  // Gera o pagamento PIX no Mercado Pago
  const pixData = await createPixPayment({
    orderId: order.id,
    title: raffle.title,
    amount: totalAmount,
    buyerName,
    buyerEmail,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      mpPaymentId: pixData.paymentId,
      mpQrCode: pixData.qrCode,
      mpPixCopiaECola: pixData.pixCopiaECola,
    }
  });

  redirect(`/pedido/${order.id}`);
}
