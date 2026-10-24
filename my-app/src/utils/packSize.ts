import type { PackUnit } from "@/types/models";

const PACK_UNIT_LABELS: Record<PackUnit, string> = {
  ML: "ml",
  L: "L",
  G: "g",
  KG: "kg",
  PCS: "pcs",
  PACK: "pack",
  DOZEN: "dozen",
  BUNCH: "bunch",
};

const formatPackQuantity = (value: number): string => {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(3)));
};

export const formatPackSize = (
  quantity: number | null | undefined,
  unit: PackUnit | null | undefined,
): string => {
  if (quantity === null || quantity === undefined || !unit) return "";
  return `${formatPackQuantity(quantity)} ${PACK_UNIT_LABELS[unit]}`;
};
