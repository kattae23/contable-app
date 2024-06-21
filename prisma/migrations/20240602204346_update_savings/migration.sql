/*
  Warnings:

  - You are about to drop the column `content` on the `Savings` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Savings` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Savings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Savings" DROP COLUMN "content",
DROP COLUMN "customerId",
DROP COLUMN "published";
