import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijwqphjbqpmgybmmqxsu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseServiceKey) {
  console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding initial demo raffle for Rifa Milionária via Supabase...');

  const { data: existing } = await supabase
    .from('Raffle')
    .select('id')
    .eq('slug', 'iphone-15-pro-max-256gb')
    .maybeSingle();

  if (!existing) {
    const instantPrizes = [
      { number: 42, prize: 'R$ 100,00 via PIX Instantâneo' },
      { number: 108, prize: 'R$ 250,00 via PIX Instantâneo' },
      { number: 500, prize: 'R$ 500,00 via PIX Instantâneo' },
    ];

    const { error } = await supabase.from('Raffle').insert({
      title: 'iPhone 15 Pro Max 256GB Titânio Natural',
      slug: 'iphone-15-pro-max-256gb',
      description: 'iPhone 15 Pro Max de 256GB totalmente lacrado com garantia de 1 ano Apple + Frete Grátis para todo o Brasil. Concorra com apenas R$ 2,50 por cota na Rifa Milionária!',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop',
      costPrice: 6500.00,
      totalQuotas: 4000,
      quotaPrice: 2.50,
      selectionMode: 'BOTH',
      mpFeePercent: 0.99,
      drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      hasInstantPrizes: true,
      instantPrizesCount: 3,
      instantPrizesDetails: JSON.stringify(instantPrizes),
    });

    if (error) {
      console.error('Erro ao inserir rifa demo no Supabase:', error);
    } else {
      console.log('Rifa demo criada com sucesso no Supabase!');
    }
  } else {
    console.log('Rifa demo já existe no Supabase!');
  }
}

seed().catch(console.error);
