import type { Request, Response } from "express";

import { verifyPayment } from "../services/order.service";
import { AppError } from "../utils/AppError";
import type { CheckoutPageQuery } from "../validators/payment.validators";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
};

const CHECKOUT_CSP = [
  "default-src 'self'",
  "script-src 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com https://*.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
  "child-src https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
  "connect-src https://api.razorpay.com https://*.razorpay.com",
  "img-src 'self' data: https:",
  "style-src 'unsafe-inline'",
  "form-action https://api.razorpay.com https://*.razorpay.com",
].join("; ");

const buildCheckoutHtml = (query: CheckoutPageQuery): string => {
  const payloadJson = JSON.stringify({
    key: query.keyId,
    amount: query.amount,
    currency: query.currency,
    name: query.name,
    order_id: query.orderId,
    theme: { color: "#145C38" },
    ...(query.prefillName || query.prefillEmail || query.prefillContact
      ? {
          prefill: {
            ...(query.prefillName ? { name: query.prefillName } : {}),
            ...(query.prefillEmail ? { email: query.prefillEmail } : {}),
            ...(query.prefillContact ? { contact: query.prefillContact } : {}),
          },
        }
      : {}),
  }).replace(/</g, "\\u003c");
  const returnUrlJson = JSON.stringify(query.returnUrl).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sainik Mart Payment</title>
    <style>
      html, body { margin: 0; padding: 0; background: #145C38; color: #fff; font-family: -apple-system, sans-serif; height: 100%; }
      .wrap { min-height: 100%; display: flex; align-items: center; justify-content: center; }
    </style>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div class="wrap">Opening payment…</div>
    <script>
      (function () {
        var payload = ${payloadJson};
        var returnUrl = ${returnUrlJson};
        function go(params) {
          var url = new URL(returnUrl);
          Object.keys(params).forEach(function (key) {
            if (params[key] != null && params[key] !== "") {
              url.searchParams.set(key, String(params[key]));
            }
          });
          window.location = url.toString();
        }
        var options = Object.assign({}, payload, {
          handler: function (response) {
            go({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              go({ cancelled: "1" });
            }
          }
        });
        try {
          var rzp = new Razorpay(options);
          rzp.on("payment.failed", function (response) {
            var description =
              response && response.error && response.error.description
                ? response.error.description
                : "Payment failed";
            go({ error: description });
          });
          rzp.open();
        } catch (err) {
          go({ error: "Unable to open checkout" });
        }
      })();
    </script>
  </body>
</html>`;
};

export const checkoutPage = (req: Request, res: Response): void => {
  const html = buildCheckoutHtml(req.query as unknown as CheckoutPageQuery);
  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", CHECKOUT_CSP);
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.send(html);
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  const data = await verifyPayment(requireUserId(req), req.body);
  res.status(200).json({ success: true, data });
};
