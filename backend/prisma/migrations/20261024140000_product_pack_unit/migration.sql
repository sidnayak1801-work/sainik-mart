-- CreateEnum
CREATE TYPE "public"."PackUnit" AS ENUM ('ML', 'L', 'G', 'KG', 'PCS', 'PACK', 'DOZEN', 'BUNCH');

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN "pack_quantity" DECIMAL(10,3),
ADD COLUMN "pack_unit" "public"."PackUnit";
