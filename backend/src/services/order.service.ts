import { OrderStatus, Prisma, type OrderItem } from "@prisma/client";

import type { AdminOrderListQuery, CreateOrderInput, OrderListQuery } from "../validators/order.validators";
import { AppError } from "../utils/AppError";
import { notImplemented } from "../utils/notImplemented";
import { prisma } from "../utils/prisma";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: {
            select: { isActive: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

const orderInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
  },
} as const;

const orderDetailInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
  },
  address: {
    select: {
      id: true,
      addressLine: true,
      city: true,
      pincode: true,
    },
  },
} as const;

const adminOrderDetailInclude = {
  ...orderDetailInclude,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PACKING],
  PACKING: [OrderStatus.OUT_FOR_DELIVERY],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>;
type AdminOrderWithDetails = Prisma.OrderGetPayload<{ include: typeof adminOrderDetailInclude }>;
type OrderListRow = Prisma.OrderGetPayload<{
  include: { _count: { select: { items: true } } };
}>;
type AdminOrderListRow = Prisma.OrderGetPayload<{
  include: {
    _count: { select: { items: true } };
    user: { select: { name: true; email: true; phone: true } };
  };
}>;

const toMoney = (value: Prisma.Decimal): number => Number(value);

const unitPrice = (product: { price: Prisma.Decimal; discountPrice: Prisma.Decimal | null }): Prisma.Decimal => {
  return product.discountPrice ?? product.price;
};

const serializeOrder = (order: OrderWithItems) => ({
  id: order.id,
  addressId: order.addressId,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  subtotal: toMoney(order.subtotal),
  deliveryFee: toMoney(order.deliveryFee),
  discount: toMoney(order.discount),
  totalAmount: toMoney(order.totalAmount),
  createdAt: order.createdAt,
  items: order.items.map((item: OrderItem) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    price: toMoney(item.price),
    quantity: item.quantity,
    total: toMoney(item.total),
  })),
});

const serializeOrderSummary = (order: OrderListRow) => ({
  id: order.id,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  totalAmount: toMoney(order.totalAmount),
  createdAt: order.createdAt,
  itemCount: order._count.items,
});

const serializeOrderDetail = (order: OrderWithDetails) => ({
  ...serializeOrder(order),
  address: {
    id: order.address.id,
    addressLine: order.address.addressLine,
    city: order.address.city,
    pincode: order.address.pincode,
  },
});

const serializeAdminOrderSummary = (order: AdminOrderListRow) => ({
  ...serializeOrderSummary(order),
  customer: {
    name: order.user.name,
    email: order.user.email,
    phone: order.user.phone,
  },
});

const serializeAdminOrderDetail = (order: AdminOrderWithDetails) => ({
  ...serializeOrderDetail(order),
  customer: {
    id: order.user.id,
    name: order.user.name,
    email: order.user.email,
    phone: order.user.phone,
  },
});

const isUuid = (value: string): boolean => UUID_PATTERN.test(value);

const assertPurchasable = (product: { isActive: boolean; category: { isActive: boolean } }) => {
  if (!product.isActive || !product.category.isActive) {
    throw new AppError("Product is not available", 400);
  }
};

export const createOrder = async (userId: string, input: CreateOrderInput) => {
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
    select: { id: true },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: cartInclude,
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const lines = cart.items.map((item) => {
    if (item.quantity <= 0) {
      throw new AppError("Invalid quantity", 400);
    }
    assertPurchasable(item.product);
    if (item.quantity > item.product.stockQuantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const price = unitPrice(item.product);
    const total = price.mul(item.quantity);
    return {
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price,
      total,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum.add(line.total), new Prisma.Decimal(0));
  const deliveryFee = new Prisma.Decimal(0);
  const discount = new Prisma.Decimal(0);
  const totalAmount = subtotal.add(deliveryFee).sub(discount);

  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        addressId: address.id,
        subtotal,
        deliveryFee,
        discount,
        totalAmount,
      },
    });

    for (const line of lines) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: line.productId,
          productName: line.productName,
          price: line.price,
          quantity: line.quantity,
          total: line.total,
        },
      });

      const stock = await tx.product.updateMany({
        where: {
          id: line.productId,
          isActive: true,
          stockQuantity: { gte: line.quantity },
          category: { isActive: true },
        },
        data: {
          stockQuantity: { decrement: line.quantity },
        },
      });

      if (stock.count !== 1) {
        throw new AppError("Insufficient stock", 400);
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });
  });

  return serializeOrder(created);
};

export const listOrders = async (userId: string, query: OrderListQuery) => {
  const { page, limit } = query;
  const where: Prisma.OrderWhereInput = { userId };
  const skip = (page - 1) * limit;

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: orders.map(serializeOrderSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (userId: string, id: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderDetailInclude,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return serializeOrderDetail(order);
};

export const cancelOrder = async (_userId: string, _id: string) => {
  return notImplemented("Cancel order");
};

export const listAdminOrders = async (query: AdminOrderListQuery) => {
  const { page, limit, status, search } = query;
  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.orderStatus = status;
  }

  if (search) {
    if (isUuid(search)) {
      where.id = search;
    } else {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      };
    }
  }

  const skip = (page - 1) * limit;
  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: orders.map(serializeAdminOrderSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const getAdminOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: adminOrderDetailInclude,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return serializeAdminOrderDetail(order);
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, orderStatus: true },
  });

  if (!existing) {
    throw new AppError("Order not found", 404);
  }

  const allowed = ALLOWED_ORDER_STATUS_TRANSITIONS[existing.orderStatus];
  if (!allowed.includes(status)) {
    throw new AppError("Invalid status transition", 400);
  }

  await prisma.order.update({
    where: { id },
    data: { orderStatus: status },
  });

  return getAdminOrderById(id);
};
