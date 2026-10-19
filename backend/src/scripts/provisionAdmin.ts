import "../config/env";
import { hashPassword } from "../utils/password";
import { AppError } from "../utils/AppError";
import { normalizeIndianMobile } from "../utils/phone";
import { prisma } from "../utils/prisma";

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const provisionAdmin = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const rawPhone = process.env.ADMIN_PHONE?.trim() ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !email.includes("@")) {
    fail("ADMIN_EMAIL is required and must be a valid email.");
  }
  if (password.length < 8 || password.length > 128) {
    fail("ADMIN_PASSWORD is required and must be 8–128 characters.");
  }
  if (!rawPhone) {
    fail("ADMIN_PHONE is required (users.phone is unique and required).");
  }

  let phone: string;
  try {
    phone = normalizeIndianMobile(rawPhone);
  } catch (error) {
    if (error instanceof AppError) {
      fail(`ADMIN_PHONE is invalid: ${error.message}`);
    }
    throw error;
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    console.log(`Admin user already exists for ${email}. Password and role were not changed.`);
    return;
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    fail(`ADMIN_PHONE ${phone} is already used by another account. Choose a different number.`);
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log(`Created ADMIN user ${email}.`);
};

provisionAdmin()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
