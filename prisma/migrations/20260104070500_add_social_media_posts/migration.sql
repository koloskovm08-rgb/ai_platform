-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('VK', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "SocialContentType" AS ENUM ('GENERATION', 'EDIT', 'BUSINESS_CARD_PROJECT');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "SocialContentType" NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "caption" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_media_posts_userId_idx" ON "social_media_posts"("userId");

-- CreateIndex
CREATE INDEX "social_media_posts_platform_idx" ON "social_media_posts"("platform");

-- CreateIndex
CREATE INDEX "social_media_posts_status_idx" ON "social_media_posts"("status");

-- CreateIndex
CREATE INDEX "social_media_posts_scheduledFor_idx" ON "social_media_posts"("scheduledFor");

-- CreateIndex
CREATE INDEX "social_media_posts_status_scheduledFor_idx" ON "social_media_posts"("status", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_posts_platform_externalId_key" ON "social_media_posts"("platform", "externalId");

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


