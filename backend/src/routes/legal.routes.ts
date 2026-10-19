import { Router, type Request, type Response } from "express";

const page = (title: string, body: string): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Sainik Mart</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #122; }
    a { color: #145C38; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
  <p><a href="https://admin.sainikmartapp.in">Sainik Mart</a></p>
</body>
</html>`;

const privacyHtml = page(
  "Privacy Policy",
  `<p>Sainik Mart (“we”) operates the grocery app and website. We collect only what we need to run the store.</p>
  <h2>What we collect</h2>
  <p>Account: mobile number (and name/email if provided). After login: cart, delivery addresses, order history, and an optional push-notification device token. Payments are processed by Razorpay; we store payment status and Razorpay order/payment ids, not full card numbers. Login OTPs are sent via MSG91; we store hashed OTP codes temporarily.</p>
  <h2>How we use it</h2>
  <p>To fulfil orders, show your cart and past purchases, send delivery and order notifications, and keep the app secure. We do not sell personal data.</p>
  <h2>Sharing</h2>
  <p>Delivery partners receive address details needed to complete a delivery. Razorpay and MSG91 process payments and OTPs as processors. We may disclose data when the law requires it.</p>
  <h2>Retention and deletion</h2>
  <p>You can sign out anytime. In the app, Profile → Delete account removes your login identity, cart, unused addresses, and device tokens. Order records needed for accounts and tax are anonymised, not sold. You can also request deletion at <a href="mailto:hello@sainikmart.in">hello@sainikmart.in</a> or via <a href="/account-deletion">account deletion</a>.</p>
  <p>Contact: hello@sainikmart.in</p>`,
);

const deletionHtml = page(
  "Account deletion",
  `<p>To delete your Sainik Mart customer account:</p>
  <ol>
    <li>Open the Sainik Mart app and sign in.</li>
    <li>Go to Profile and tap <strong>Delete account</strong>.</li>
    <li>Confirm. We remove your phone login, cart, unused addresses, and notification tokens. Past orders are kept in anonymised form for tax and operations.</li>
  </ol>
  <p>If you cannot use the app, email <a href="mailto:hello@sainikmart.in">hello@sainikmart.in</a> from the number on the account. We process requests within 30 days.</p>`,
);

const termsHtml = page(
  "Terms and Conditions",
  `<p>By using Sainik Mart you agree to these terms. Browse as a guest; checkout requires an account. Prices and stock at checkout apply. You must provide a complete delivery address. Cancellation is available while an order is still pending. Do not misuse the app. Contact hello@sainikmart.in.</p>`,
);

const legalRouter = Router();

legalRouter.get("/privacy", (_req: Request, res: Response) => {
  res.type("html").send(privacyHtml);
});

legalRouter.get("/account-deletion", (_req: Request, res: Response) => {
  res.type("html").send(deletionHtml);
});

legalRouter.get("/terms", (_req: Request, res: Response) => {
  res.type("html").send(termsHtml);
});

export default legalRouter;
