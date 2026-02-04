/*
  Warnings:

  - Added the required column `siteId` to the `DamageReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Return` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "DamageStatus" ADD VALUE 'REORDERED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INDENT_ON_HOLD';
ALTER TYPE "NotificationType" ADD VALUE 'INDENT_URGENT';
ALTER TYPE "NotificationType" ADD VALUE 'INDENT_CLOSED';
ALTER TYPE "NotificationType" ADD VALUE 'DAMAGE_REPAIRED';
ALTER TYPE "NotificationType" ADD VALUE 'PARTIAL_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'PARTIAL_REORDERED';
ALTER TYPE "NotificationType" ADD VALUE 'SITE_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'USER_REGISTERED';

-- AlterTable
ALTER TABLE "DamageReport" ADD COLUMN     "isReordered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reorderExpectedDate" TIMESTAMP(3),
ADD COLUMN     "reorderedAt" TIMESTAMP(3),
ADD COLUMN     "reorderedById" TEXT,
ADD COLUMN     "siteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isPurchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purchasedAt" TIMESTAMP(3),
ADD COLUMN     "reorderExpectedDate" TIMESTAMP(3),
ADD COLUMN     "reorderReason" TEXT,
ADD COLUMN     "reorderedAt" TIMESTAMP(3),
ADD COLUMN     "vendorContactPerson" TEXT,
ADD COLUMN     "vendorContactPhone" TEXT,
ADD COLUMN     "vendorGstNo" TEXT,
ADD COLUMN     "vendorNatureOfBusiness" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "vendorAddress" TEXT,
ADD COLUMN     "vendorContactPerson" TEXT,
ADD COLUMN     "vendorContactPhone" TEXT,
ADD COLUMN     "vendorGstNo" TEXT,
ADD COLUMN     "vendorName" TEXT,
ADD COLUMN     "vendorNatureOfBusiness" TEXT;

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "name" TEXT,
ADD COLUMN     "siteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "siteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushToken" TEXT;

-- CreateTable
CREATE TABLE "OrderInvoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemInvoice" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderInvoice_orderId_idx" ON "OrderInvoice"("orderId");

-- CreateIndex
CREATE INDEX "OrderItemInvoice_orderItemId_idx" ON "OrderItemInvoice"("orderItemId");

-- CreateIndex
CREATE INDEX "DamageReport_siteId_idx" ON "DamageReport"("siteId");

-- CreateIndex
CREATE INDEX "Order_isPurchased_idx" ON "Order"("isPurchased");

-- CreateIndex
CREATE INDEX "Receipt_siteId_idx" ON "Receipt"("siteId");

-- CreateIndex
CREATE INDEX "Return_siteId_idx" ON "Return"("siteId");

-- AddForeignKey
ALTER TABLE "OrderInvoice" ADD CONSTRAINT "OrderInvoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemInvoice" ADD CONSTRAINT "OrderItemInvoice_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "Indent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "Indent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
