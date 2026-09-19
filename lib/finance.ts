export interface FinanceCalculationInput {
  totalQuotas: number;
  quotaPrice: number;
  costPrice: number;
  mpFeePercent?: number; // Padrão: 0.99% PIX Mercado Pago
}

export interface FinanceCalculationResult {
  grossRevenue: number;     // Receita Bruta Total
  mpFeeAmount: number;      // Taxa Retida pelo Mercado Pago
  netRevenue: number;       // Receita Líquida após taxas
  netProfit: number;        // Lucro Líquido Real (Receita Líquida - Custo)
  profitMarginPercent: number; // Margem de Lucro %
}

/**
 * Calcula os custos, receita, taxa do Mercado Pago e lucro líquido estimado para uma rifa.
 */
export function calculateRaffleFinances(input: FinanceCalculationInput): FinanceCalculationResult {
  const { totalQuotas, quotaPrice, costPrice, mpFeePercent = 0.99 } = input;

  const grossRevenue = totalQuotas * quotaPrice;
  const mpFeeAmount = grossRevenue * (mpFeePercent / 100);
  const netRevenue = grossRevenue - mpFeeAmount;
  const netProfit = netRevenue - costPrice;
  const profitMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    grossRevenue: Number(grossRevenue.toFixed(2)),
    mpFeeAmount: Number(mpFeeAmount.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata o número da cota de acordo com a quantidade de cotas da rifa,
 * garantindo compatibilidade total com extrações da Loteria Federal
 * (ex: 100 cotas -> 2 dígitos 00-99; 1000 cotas -> 3 dígitos 000-999; 10k -> 4 dígitos; 100k -> 5 dígitos).
 */
export function formatTicketNumber(num: number, totalQuotas: number = 1000): string {
  // Quantidade de dígitos para fechar com a loteria federal
  let digits = 3;
  if (totalQuotas >= 1000000) digits = 6;
  else if (totalQuotas >= 100000) digits = 5;
  else if (totalQuotas >= 10000) digits = 4;
  else if (totalQuotas >= 1000) digits = 3;
  else if (totalQuotas >= 100) digits = 2;
  else digits = 2;

  return String(num).padStart(digits, '0');
}

