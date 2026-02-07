-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "indentItemId" TEXT,
ADD COLUMN     "isReordered" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "OrderItem_indentItemId_idx" ON "OrderItem"("indentItemId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_indentItemId_fkey" FOREIGN KEY ("indentItemId") REFERENCES "IndentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
