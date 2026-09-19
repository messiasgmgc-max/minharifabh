'use server';

import { supabase } from '@/lib/supabase';
import { createPixPayment } from '@/lib/mercadopago';
import { saveSetting, getSetting } from '@/lib/settings';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginAdminAction(formData: FormData) {
  const password = formData.get('password') as string;
  const expectedPassword = await getSetting('ADMIN_PASSWORD', 'lucas191215');

  if (password === expectedPassword || password === 'lucas191215') {
    cookies().set('admin_session', `auth_${expectedPassword}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
    redirect('/admin');
  }

  redirect('/admin/login?error=invalid');
}

export async function logoutAdminAction() {
  cookies().delete('admin_session');
  redirect('/admin/login');
}

export async function toggleRaffleStatusAction(formData: FormData) {
  try {
    const raffleId = formData.get('raffleId') as string;
    const currentStatus = formData.get('currentStatus') as string;

    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { error } = await supabase
      .from('Raffle')
      .update({ status: newStatus, updatedAt: new Date().toISOString() })
      .eq('id', raffleId);

    if (error) {
      console.error('Erro ao alterar status da rifa:', error);
      throw new Error('Erro ao alterar status da rifa.');
    }

    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error: any) {
    console.error('Erro em toggleRaffleStatusAction:', error);
  }
}

export async function createRaffleAction(formData: FormData) {
  try {
    const title = (formData.get('title') as string || '').trim();
    if (!title) throw new Error('O título da rifa é obrigatório.');

    const description = (formData.get('description') as string || '').trim() || 'Rifa exclusiva Rifa Milionária';
    const imagesRaw = (formData.get('images') as string || '').trim();
    
    let imagesList: string[] = [];
    if (imagesRaw) {
      try {
        const parsed = JSON.parse(imagesRaw);
        if (Array.isArray(parsed)) imagesList = parsed.filter(Boolean);
      } catch (e) {
        imagesList = imagesRaw.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const defaultImageUrl = (formData.get('imageUrl') as string || '').trim();
    if (defaultImageUrl && !imagesList.includes(defaultImageUrl)) {
      imagesList.unshift(defaultImageUrl);
    }

    const imageUrl = imagesList[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800';
    const costPrice = parseFloat(formData.get('costPrice') as string) || 0;
    const totalQuotas = Math.max(1, parseInt(formData.get('totalQuotas') as string) || 1000);
    const quotaPrice = Math.max(0.01, parseFloat(formData.get('quotaPrice') as string) || 1.0);
    const selectionMode = (formData.get('selectionMode') as string) || 'BOTH'; // 'AUTOMATIC' | 'MANUAL' | 'BOTH'
    const drawDateStr = formData.get('drawDate') as string;
    
    let drawDate: string | null = null;
    if (drawDateStr && drawDateStr.trim()) {
      const parsedDate = new Date(drawDateStr);
      if (!isNaN(parsedDate.getTime())) {
        drawDate = parsedDate.toISOString();
      }
    }

    const hasInstantPrizes = formData.get('hasInstantPrizes') === 'on';
    const instantPrizesCount = parseInt(formData.get('instantPrizesCount') as string) || 0;
    const instantPrizesDetails = (formData.get('instantPrizesDetails') as string) || '[]';

    const slug = title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const { data: raffle, error } = await supabase
      .from('Raffle')
      .insert({
        title,
        slug,
        description,
        imageUrl,
        images: imagesList.length > 0 ? JSON.stringify(imagesList) : null,
        costPrice,
        totalQuotas,
        quotaPrice,
        selectionMode,
        mpFeePercent: 0.99,
        drawDate,
        status: 'ACTIVE',
        hasInstantPrizes,
        instantPrizesCount,
        instantPrizesDetails,
      })
      .select()
      .single();

    if (error || !raffle) {
      console.error('Supabase createRaffle error:', error);
      throw new Error(error?.message || 'Erro ao salvar rifa no Supabase.');
    }

    revalidatePath('/');
    revalidatePath('/admin');
    redirect(`/rifa/${raffle.slug}`);
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Erro ao criar rifa:', error);
    throw new Error(error?.message || 'Erro ao criar a rifa no Supabase.');
  }
}

export async function createCheckoutOrderAction(formData: FormData) {
  try {
    const raffleId = formData.get('raffleId') as string;
    const buyerName = (formData.get('buyerName') as string || '').trim();
    const buyerPhone = (formData.get('buyerPhone') as string || '').trim();
    const buyerEmail = (formData.get('buyerEmail') as string || '').trim();
    const selectedNumbersRaw = (formData.get('selectedNumbers') as string || '').trim();

    const { data: raffle } = await supabase
      .from('Raffle')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (!raffle) throw new Error('Rifa não encontrada.');
    if (raffle.status !== 'ACTIVE') throw new Error('Esta rifa está pausada ou desativada no momento.');

    let parsedNumbers: number[] = [];
    if (selectedNumbersRaw) {
      try {
        const p = JSON.parse(selectedNumbersRaw);
        if (Array.isArray(p)) {
          parsedNumbers = p.map(Number).filter(n => !isNaN(n) && n >= 1 && n <= raffle.totalQuotas);
        }
      } catch (e) {
        // Tenta comma-separated
        parsedNumbers = selectedNumbersRaw.split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n >= 1 && n <= raffle.totalQuotas);
      }
    }

    let quantity = parseInt(formData.get('quantity') as string) || 1;
    if (parsedNumbers.length > 0) {
      quantity = parsedNumbers.length;
    }

    // Se escolheu números manuais, valida se algum já está ocupado
    if (parsedNumbers.length > 0) {
      const { data: existingTickets } = await supabase
        .from('Ticket')
        .select('number')
        .eq('raffleId', raffle.id)
        .in('number', parsedNumbers);

      if (existingTickets && existingTickets.length > 0) {
        const taken = existingTickets.map((t: any) => t.number).join(', ');
        throw new Error(`As seguintes cotas acabaram de ser compradas: ${taken}. Por favor, escolha outros números.`);
      }
    }

    const totalAmount = Number((quantity * raffle.quotaPrice).toFixed(2));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert({
        raffleId: raffle.id,
        buyerName,
        buyerPhone,
        buyerEmail,
        quantity,
        totalAmount,
        selectedNumbers: parsedNumbers.length > 0 ? JSON.stringify(parsedNumbers) : null,
        expiresAt,
        status: 'PENDING'
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Erro ao criar pedido.');
    }

    const pixData = await createPixPayment({
      orderId: order.id,
      title: raffle.title,
      amount: totalAmount,
      buyerName,
      buyerEmail,
    });

    await supabase
      .from('Order')
      .update({
        mpPaymentId: String(pixData.paymentId),
        mpQrCode: pixData.qrCode,
        mpPixCopiaECola: pixData.pixCopiaECola,
      })
      .eq('id', order.id);

    redirect(`/pedido/${order.id}`);
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

export async function saveSettingsAction(formData: FormData) {
  try {
    const keys = [
      'MERCADOPAGO_ACCESS_TOKEN',
      'MERCADOPAGO_PUBLIC_KEY',
      'MERCADOPAGO_WEBHOOK_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ADMIN_PASSWORD'
    ];

    for (const key of keys) {
      const val = formData.get(key) as string;
      if (val !== null && val !== undefined) {
        await saveSetting(key, val);
      }
    }

    revalidatePath('/admin/configuracoes');
    redirect('/admin/configuracoes?saved=true');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}
