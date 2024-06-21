/*
  Warnings:

  - You are about to drop the column `content` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `title` to the `Expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Savings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Savings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Savings" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "content",
DROP COLUMN "published",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;
