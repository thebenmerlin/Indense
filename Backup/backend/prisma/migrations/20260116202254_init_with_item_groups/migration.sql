/*
  Warnings:

  - You are about to drop the column `category` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Material` table. All the data in the column will be lost.
  - Added the required column `itemGroupId` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Material_category_idx";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "category",
DROP COLUMN "unit",
ADD COLUMN     "isSystemData" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemGroupId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ItemGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemGroup_name_key" ON "ItemGroup"("name");

-- CreateIndex
CREATE INDEX "ItemGroup_name_idx" ON "ItemGroup"("name");

-- CreateIndex
CREATE INDEX "ItemGroup_isActive_idx" ON "ItemGroup"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "UnitOfMeasure"("code");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_code_idx" ON "UnitOfMeasure"("code");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_isActive_idx" ON "UnitOfMeasure"("isActive");

-- CreateIndex
CREATE INDEX "Material_itemGroupId_idx" ON "Material"("itemGroupId");

-- CreateIndex
CREATE INDEX "Material_unitId_idx" ON "Material"("unitId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
