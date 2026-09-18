import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding initial demo raffle...');

  const existing = await prisma.raffle.findFirst({
    where: { slug: 'iphone-15-pro-max-256gb' }
  });

  if (!existing) {
    const instantPrizes = [
      { number: 42, prize: 'R$ 100,00 via PIX Instantâneo' },
      { number: 108, prize: 'R$ 250,00 via PIX Instantâneo' },
      { number: 500, prize: 'R$ 500,00 via PIX Instantâneo' },
    ];

    await prisma.raffle.create({
      data: {
        title: 'iPhone 15 Pro Max 256GB Titânio Natural',
        slug: 'iphone-15-pro-max-256gb',
        description: 'iPhone 15 Pro Max de 256GB totalmente lacrado com garantia de 1 ano Apple + Frete Grátis para todo o Brasil. Concorra com apenas R$ 2,50 por cota!',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop',
        costPrice: 6500.00,
        totalQuotas: 4000,
        quotaPrice: 2.50,
        mpFeePercent: 0.99,
        drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        hasInstantPrizes: true,
        instantPrizesCount: 3,
        instantPrizesDetails: JSON.stringify(instantPrizes),
      }
    });

    console.log('Demo raffle created successfully!');
  } else {
    console.log('Demo raffle already exists!');
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
