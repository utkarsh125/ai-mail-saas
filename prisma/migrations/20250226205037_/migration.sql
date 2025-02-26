/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ChatbotInteraction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatbotInteraction_userId_key" ON "ChatbotInteraction"("userId");
