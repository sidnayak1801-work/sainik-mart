-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "public"."users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "public"."users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "public"."users" ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false;
UPDATE "public"."users" SET "is_verified" = true;

-- AlterTable
ALTER TABLE "public"."auth_otps" ADD COLUMN "verified_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "auth_otps_expires_at_idx" ON "public"."auth_otps"("expires_at");
