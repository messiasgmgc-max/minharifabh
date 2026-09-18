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
