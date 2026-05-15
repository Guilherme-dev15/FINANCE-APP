/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Debt` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmountPaid` on the `Debt` table. All the data in the column will be lost.
  - You are about to alter the column `originalAmount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `currentAmount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `interestRate` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(8,4)`.
  - The `status` column on the `Debt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `debtType` column on the `Debt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('CREDIT_CARD', 'LOAN', 'FORMAL', 'INFORMAL');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'NA_GAVETA', 'RENEGOTIATED', 'PAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('ESSENTIAL', 'LIFESTYLE', 'WASTE');

-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "totalAmount",
DROP COLUMN "totalAmountPaid",
ADD COLUMN     "cetRate" DECIMAL(8,4),
ADD COLUMN     "customInstallment" DECIMAL(12,2),
ADD COLUMN     "haircutDiscount" DECIMAL(5,2),
ADD COLUMN     "informalContact" TEXT,
ADD COLUMN     "iofAmount" DECIMAL(12,2),
ADD COLUMN     "originalCreditor" TEXT,
ALTER COLUMN "originalAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(8,4),
DROP COLUMN "status",
ADD COLUMN     "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "debtType",
ADD COLUMN     "debtType" "DebtType" NOT NULL DEFAULT 'LOAN';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'FIXED',
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'VARIABLE',
    "category" "ExpenseCategory" NOT NULL DEFAULT 'ESSENTIAL',
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
