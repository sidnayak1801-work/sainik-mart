-- AlterTable
ALTER TABLE "public"."addresses"
ADD COLUMN "full_name" VARCHAR(120) NOT NULL DEFAULT '',
ADD COLUMN "mobile" VARCHAR(20) NOT NULL DEFAULT '';

-- Backfill recipient fields from the account owner.
UPDATE "public"."addresses" AS a
SET
  "full_name" = COALESCE(NULLIF(BTRIM(u."name"), ''), 'Customer'),
  "mobile" = u."phone"
FROM "public"."users" AS u
WHERE a."user_id" = u."id";
