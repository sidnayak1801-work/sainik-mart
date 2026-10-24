-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('RAZORPAY', 'COD');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN "payment_method" "public"."PaymentMethod" NOT NULL DEFAULT 'RAZORPAY';

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN "payment_method" "public"."PaymentMethod" NOT NULL DEFAULT 'RAZORPAY';

-- CreateIndex
CREATE INDEX "orders_payment_method_idx" ON "public"."orders"("payment_method");

-- CreateIndex
CREATE INDEX "payments_payment_method_idx" ON "public"."payments"("payment_method");
