import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getOrder, updateOrderStatus } from "@/api/orders";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import catalog from "@/components/ui/catalog.module.css";
import { useToast } from "@/components/ui/toast-context";
import { nextOrderStatuses } from "@/constants/orders";
import type { OrderDetail, OrderItem, OrderStatus } from "@/types/models";
import { formatDate, formatMoney, formatOrderStatus } from "@/utils/format";

import styles from "./OrderDetailPage.module.css";

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

export const OrderDetailPage = () => {
  const { id = "" } = useParams();
  const { notify } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(id);
      setOrder(data);
      const next = nextOrderStatuses(data.orderStatus);
      setNextStatus(next[0] ?? "");
    } catch (err) {
      setOrder(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const allowed = order ? nextOrderStatuses(order.orderStatus) : [];

  const onConfirmStatus = async () => {
    if (!order || !pendingStatus) return;
    setWorking(true);
    try {
      const updated = await updateOrderStatus(order.id, pendingStatus);
      setOrder(updated);
      const next = nextOrderStatuses(updated.orderStatus);
      setNextStatus(next[0] ?? "");
      setPendingStatus(null);
      notify("Order status updated.");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setWorking(false);
    }
  };

  const itemColumns: Column<OrderItem>[] = [
    { header: "Item", render: (row) => row.productName },
    { header: "Qty", render: (row) => row.quantity },
    { header: "Price", render: (row) => formatMoney(row.price) },
    { header: "Total", render: (row) => formatMoney(row.total) },
  ];

  return (
    <div>
      <AdminPageHeader title="Orders" description="Order details and fulfillment." />
      <Link className={styles.back} to="/admin/orders">
        Back to orders
      </Link>
      {loading ? (
        <p className={catalog.status}>Loading order...</p>
      ) : error || !order ? (
        <div className={catalog.status}>
          <p>{error ?? "Order not found."}</p>
          <button type="button" className={catalog.primary} onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <section className={styles.section}>
              <h2>Order</h2>
              <dl>
                <dt>ID</dt>
                <dd>{order.id}</dd>
                <dt>Date</dt>
                <dd>{formatDate(order.createdAt)}</dd>
                <dt>Status</dt>
                <dd>
                  <OrderStatusBadge status={order.orderStatus} />
                </dd>
                <dt>Payment</dt>
                <dd>{order.paymentStatus}</dd>
              </dl>
              {allowed.length === 0 ? (
                <p className={styles.terminal}>This order is {formatOrderStatus(order.orderStatus).toLowerCase()}.</p>
              ) : (
                <div className={styles.statusRow}>
                  <label>
                    Next status
                    <select
                      aria-label="Next status"
                      value={nextStatus}
                      disabled={working}
                      onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                    >
                      {allowed.map((value) => (
                        <option key={value} value={value}>
                          {formatOrderStatus(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={catalog.primary}
                    disabled={working || !nextStatus}
                    onClick={() => setPendingStatus(nextStatus || null)}
                  >
                    Update status
                  </button>
                </div>
              )}
            </section>
            <section className={styles.section}>
              <h2>Customer</h2>
              <dl>
                <dt>Name</dt>
                <dd>{order.customer.name}</dd>
                <dt>Email</dt>
                <dd>{order.customer.email}</dd>
                <dt>Phone</dt>
                <dd>{order.customer.phone}</dd>
              </dl>
            </section>
            <section className={styles.section}>
              <h2>Address</h2>
              <dl>
                <dt>Line</dt>
                <dd>{order.address.addressLine}</dd>
                <dt>City</dt>
                <dd>{order.address.city}</dd>
                <dt>Pincode</dt>
                <dd>{order.address.pincode}</dd>
              </dl>
            </section>
          </div>

          <section className={styles.section}>
            <h2>Items</h2>
            <DataTable columns={itemColumns} rows={order.items} rowKey={(row) => row.id} emptyMessage="No items." />
            <div className={styles.totals}>
              <div>Subtotal {formatMoney(order.subtotal)}</div>
              <div>Delivery {formatMoney(order.deliveryFee)}</div>
              <div>Discount {formatMoney(order.discount)}</div>
              <strong>Total {formatMoney(order.totalAmount)}</strong>
            </div>
          </section>
        </>
      )}

      {pendingStatus ? (
        <ConfirmDialog
          title="Update order status"
          message={`Mark this order as ${formatOrderStatus(pendingStatus)}?`}
          confirmLabel="Update"
          pending={working}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() => void onConfirmStatus()}
        />
      ) : null}
    </div>
  );
};
