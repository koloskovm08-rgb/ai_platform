-- This migration brings the database schema in line with prisma/schema.prisma.
-- It adds missing tables and columns that were introduced in the Prisma schema
-- but were not present in the earlier migrations.

-- CreateTable: password_reset_tokens
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_token_key" ON "password_reset_tokens"("email", "token");

-- CreateTable: api_keys
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requestsLimit" INTEGER NOT NULL DEFAULT 1000,
    "requestsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: generations (new fields)
ALTER TABLE "generations"
ADD COLUMN "upscaledUrl" TEXT,
ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "shareToken" TEXT,
ADD COLUMN "parentId" TEXT;

-- CreateIndex (generations)
CREATE INDEX "generations_isFavorite_idx" ON "generations"("isFavorite");
CREATE INDEX "generations_isPublic_idx" ON "generations"("isPublic");
CREATE UNIQUE INDEX "generations_shareToken_key" ON "generations"("shareToken");
CREATE INDEX "generations_shareToken_idx" ON "generations"("shareToken");
CREATE INDEX "generations_parentId_idx" ON "generations"("parentId");

-- CreateTable: business_card_projects
CREATE TABLE "business_card_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canvasData" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "thumbnailUrl" TEXT,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_card_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_card_projects_userId_idx" ON "business_card_projects"("userId");

-- CreateIndex
CREATE INDEX "business_card_projects_createdAt_idx" ON "business_card_projects"("createdAt");

-- CreateIndex
CREATE INDEX "business_card_projects_templateId_idx" ON "business_card_projects"("templateId");

-- AddForeignKey
ALTER TABLE "business_card_projects" ADD CONSTRAINT "business_card_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_card_projects" ADD CONSTRAINT "business_card_projects_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;


