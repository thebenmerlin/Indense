/*
  Warnings:

  - You are about to drop the column `siteId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `indentId` to the `DamageReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `DamageReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Indent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DamageStatus" AS ENUM ('DRAFT', 'REPORTED', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "SecurityQuestion" AS ENUM ('MOTHERS_MAIDEN_NAME', 'FIRST_PET_NAME', 'CHILDHOOD_NICKNAME', 'FIRST_SCHOOL', 'FAVORITE_BOOK', 'BIRTHPLACE_CITY');

-- DropForeignKey
ALTER TABLE "DamageReport" DROP CONSTRAINT "DamageReport_indentItemId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_siteId_fkey";

-- DropIndex
DROP INDEX "User_siteId_idx";

-- AlterTable
ALTER TABLE "DamageReport" ADD COLUMN     "indentId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "DamageStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "indentItemId" DROP NOT NULL,
ALTER COLUMN "damagedQty" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Indent" ADD COLUMN     "description" TEXT,
ADD COLUMN     "expectedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IndentItem" ADD COLUMN     "arrivalNotes" TEXT,
ADD COLUMN     "arrivalStatus" TEXT,
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "siteId",
ADD COLUMN     "currentSiteId" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "securityAnswer" TEXT,
ADD COLUMN     "securityQuestion" "SecurityQuestion",
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';

-- CreateTable
CREATE TABLE "UserSite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSite_userId_idx" ON "UserSite"("userId");

-- CreateIndex
CREATE INDEX "UserSite_siteId_idx" ON "UserSite"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSite_userId_siteId_key" ON "UserSite"("userId", "siteId");

-- CreateIndex
CREATE INDEX "DamageReport_indentId_idx" ON "DamageReport"("indentId");

-- CreateIndex
CREATE INDEX "DamageReport_status_idx" ON "DamageReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_currentSiteId_idx" ON "User"("currentSiteId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentSiteId_fkey" FOREIGN KEY ("currentSiteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSite" ADD CONSTRAINT "UserSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSite" ADD CONSTRAINT "UserSite_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_indentItemId_fkey" FOREIGN KEY ("indentItemId") REFERENCES "IndentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
