import { Prisma, type Address } from "@prisma/client";

import type { CreateAddressInput, UpdateAddressInput } from "../validators/address.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const toCoord = (value: Prisma.Decimal | null): number | null => {
  if (value === null) {
    return null;
  }
  return Number(value);
};

const serializeAddress = (address: Address) => ({
  id: address.id,
  addressLine: address.addressLine,
  city: address.city,
  pincode: address.pincode,
  latitude: toCoord(address.latitude),
  longitude: toCoord(address.longitude),
  createdAt: address.createdAt,
  updatedAt: address.updatedAt,
});

const requireOwnedAddress = async (userId: string, addressId: string): Promise<Address> => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return address;
};

export const listAddresses = async (userId: string) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return addresses.map(serializeAddress);
};

export const createAddress = async (userId: string, input: CreateAddressInput) => {
  const address = await prisma.address.create({
    data: {
      userId,
      addressLine: input.addressLine,
      city: input.city,
      pincode: input.pincode,
      latitude: input.latitude,
      longitude: input.longitude,
    },
  });

  return serializeAddress(address);
};

export const updateAddress = async (userId: string, id: string, input: UpdateAddressInput) => {
  await requireOwnedAddress(userId, id);

  const address = await prisma.address.update({
    where: { id },
    data: input,
  });

  return serializeAddress(address);
};

export const deleteAddress = async (userId: string, id: string) => {
  await requireOwnedAddress(userId, id);

  try {
    const address = await prisma.address.delete({ where: { id } });
    return serializeAddress(address);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new AppError("Address cannot be deleted because it is used by an order", 409);
    }
    throw error;
  }
};
