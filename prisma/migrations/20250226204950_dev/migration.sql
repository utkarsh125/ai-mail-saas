-- DropIndex
DROP INDEX "ChatbotInteraction_userId_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "oramaIndex" JSONB;
