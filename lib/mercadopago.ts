import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSetting } from './settings';

/**
 * Retorna uma instância do SDK Mercado Pago configurada
 * dinamicamente com o Access Token salvo no Supabase (ou fallback para .env).
 */
export async function getMercadoPagoClient() {
  const token = await getSetting('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!token) {
    console.warn('[MercadoPago] Atenção: MERCADOPAGO_ACCESS_TOKEN não configurado no banco Supabase nem no .env.');
  }

  const client = new MercadoPagoConfig({
    accessToken: token || '',
    options: { timeout: 10000 }
  });

  const payment = new Payment(client);
  return { client, payment, token };
}

export interface CreatePixInput {
  orderId: string;
  title: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
}

export async function createPixPayment(input: CreatePixInput) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rifamilionaria.com';
  const { payment, token } = await getMercadoPagoClient();

  if (!token) {
    throw new Error('Chave MERCADOPAGO_ACCESS_TOKEN não configurada. Configure no painel /admin/configuracoes.');
  }

  // Validação e formatação de e-mail e nome
  const buyerEmail = input.buyerEmail && input.buyerEmail.includes('@')
    ? input.buyerEmail.trim()
    : 'comprador@rifamilionaria.com';

  const nameParts = (input.buyerName || 'Cliente').trim().split(' ');
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'Rifa';

  // Expiração exata de 5 minutos
  const expirationDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  try {
    const response = await payment.create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: `Rifa Milionária - ${input.title.slice(0, 50)}`,
        payment_method_id: 'pix',
        date_of_expiration: expirationDate,
        payer: {
          email: buyerEmail,
          first_name: firstName,
          last_name: lastName,
        },
        external_reference: input.orderId,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      }
    });

    const qrCode = response.point_of_interaction?.transaction_data?.qr_code_base64 || '';
    const pixCopiaECola = response.point_of_interaction?.transaction_data?.qr_code || '';
    const paymentId = response.id ? String(response.id) : null;

    if (!paymentId || !pixCopiaECola) {
      console.error('[MercadoPago Resposta Inválida]:', response);
      throw new Error('Mercado Pago não retornou dados de PIX válidos.');
    }

    return {
      paymentId,
      qrCode,
      pixCopiaECola,
    };
  } catch (error: any) {
    console.error('[MercadoPago Erro na Criação do PIX]:', error?.message || error);
    if (error?.cause) {
      console.error('[MercadoPago Causa Detalhada]:', JSON.stringify(error.cause, null, 2));
    }
    throw new Error(error?.message || 'Falha ao comunicar com a API do Mercado Pago.');
  }
}

/**
 * Consulta o status de um pagamento diretamente na API do Mercado Pago
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const { payment } = await getMercadoPagoClient();
    const paymentInfo = await payment.get({ id: paymentId });
    return {
      status: paymentInfo.status || 'pending',
      statusDetail: paymentInfo.status_detail || '',
      externalReference: paymentInfo.external_reference || '',
    };
  } catch (error: any) {
    console.warn(`[MercadoPago Consulta Status ${paymentId}]:`, error?.message);
    return null;
  }
}
