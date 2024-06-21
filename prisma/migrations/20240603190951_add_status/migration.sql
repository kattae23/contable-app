/*
  Warnings:

  - The `accountPlans` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "AccountPlansEnum" AS ENUM ('HOBBIE', 'PRO');

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountPlans",
ADD COLUMN     "accountPlans" "AccountPlansEnum" NOT NULL DEFAULT 'HOBBIE';
