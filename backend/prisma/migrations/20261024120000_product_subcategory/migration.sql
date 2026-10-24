-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN "subcategory_id" UUID;

-- CreateIndex
CREATE INDEX "products_subcategory_id_idx" ON "public"."products"("subcategory_id");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
