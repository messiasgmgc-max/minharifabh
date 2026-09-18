-- ==============================================================================
-- SCRIPT DDL COMPLETO PARA CRIAR AS TABELAS NO SUPABASE SQL EDITOR
-- Sistema: Rifa Milionária (rifamilionaria.com)
-- Copie todo este conteúdo, cole no SQL Editor do Supabase e clique em "Run".
-- ==============================================================================

-- Habilita extensão de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Raffle (Rifas)
CREATE TABLE IF NOT EXISTS "Raffle" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalQuotas" INTEGER NOT NULL,
    "quotaPrice" DOUBLE PRECISION NOT NULL,
    "mpFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.99,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "selectionMode" TEXT NOT NULL DEFAULT 'BOTH', -- 'AUTOMATIC' | 'MANUAL' | 'BOTH'
    "hasInstantPrizes" BOOLEAN NOT NULL DEFAULT false,
    "instantPrizesCount" INTEGER NOT NULL DEFAULT 0,
    "instantPrizesDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Order (Pedidos / Vendas)
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "raffleId" TEXT NOT NULL REFERENCES "Raffle"("id") ON DELETE CASCADE,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "selectedNumbers" TEXT, -- JSON ou lista de números escolhidos manualmente
    "mpPaymentId" TEXT UNIQUE,
    "mpQrCode" TEXT,
    "mpPixCopiaECola" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Ticket (Cotas / Bilhetes Alocados)
CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "raffleId" TEXT NOT NULL REFERENCES "Raffle"("id") ON DELETE CASCADE,
    "orderId" TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "number" INTEGER NOT NULL,
    "isInstantWin" BOOLEAN NOT NULL DEFAULT false,
    "instantPrize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Setting (Para guardar API Keys dinâmicas do Mercado Pago e Supabase)
CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migrações seguras caso as tabelas já existam
ALTER TABLE "Raffle" ADD COLUMN IF NOT EXISTS "selectionMode" TEXT NOT NULL DEFAULT 'BOTH';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedNumbers" TEXT;

-- Criar Índices de Alta Performance
CREATE INDEX IF NOT EXISTS "idx_raffle_slug" ON "Raffle"("slug");
CREATE INDEX IF NOT EXISTS "idx_order_raffle" ON "Order"("raffleId");
CREATE INDEX IF NOT EXISTS "idx_order_buyer_phone" ON "Order"("buyerPhone");
CREATE INDEX IF NOT EXISTS "idx_ticket_raffle_number" ON "Ticket"("raffleId", "number");

-- Inserir Senha Padrão lucas191215 no Banco de Dados
INSERT INTO "Setting" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid()::text, 'ADMIN_PASSWORD', 'lucas191215', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "value" = 'lucas191215';
