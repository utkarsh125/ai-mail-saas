/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Account` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_accessToken_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accessToken",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;
