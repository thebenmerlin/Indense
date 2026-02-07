-- AlterTable
ALTER TABLE "Indent" ADD COLUMN     "isOnHold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onHoldAt" TIMESTAMP(3),
ADD COLUMN     "onHoldById" TEXT,
ADD COLUMN     "onHoldReason" TEXT,
ADD COLUMN     "releasedFromHoldAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "expectedHandoverDate" TIMESTAMP(3),
ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowedRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],
ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false;
