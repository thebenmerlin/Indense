-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_reorderedById_fkey" FOREIGN KEY ("reorderedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
