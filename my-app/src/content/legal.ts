export type LegalSection = {
  heading?: string;
  body: string;
};

export type LegalPage = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_PAGES: Record<"About" | "Terms" | "Privacy", LegalPage> = {
  About: {
    title: "About Sainik Mart",
    intro:
      "Sainik Mart is a neighbourhood grocery store in your pocket. We bring daily essentials, fresh staples, and household needs to your door with a simple, honest shopping experience.",
    sections: [
      {
        heading: "Har zaroorat, ek jagah",
        body: "Browse categories, add items to your cart as a guest, and sign in only when you are ready to check out. Your cart, addresses, and orders stay in one place so repeat shopping is quick.",
      },
      {
        heading: "What we stand for",
        body: "Clear prices, stock you can trust, and delivery updates you can follow. We do not sell size or fashion variants — just real grocery products with quantity and availability you can see before you buy.",
      },
      {
        heading: "Who we serve",
        body: "Sainik Mart is built for households that want a dependable local mart: families, working professionals, and anyone who would rather skip a crowded aisle than skip dinner.",
      },
    ],
  },
  Terms: {
    title: "Terms and Conditions",
    intro:
      "By using the Sainik Mart app you agree to these terms. They explain how orders, accounts, and delivery work. If you do not agree, please do not use the app.",
    sections: [
      {
        heading: "Accounts",
        body: "You may browse and add items as a guest. Checkout, saved addresses, and order history require an account. You are responsible for keeping your login details safe and for activity on your account.",
      },
      {
        heading: "Orders and availability",
        body: "Prices, discounts, and stock shown in the app are what we use at checkout. If an item goes out of stock after you add it, we may remove or reduce that line and will not charge you for unavailable quantity. We may refuse or cancel an order if payment fails, the address is invalid, or we cannot fulfil it.",
      },
      {
        heading: "Delivery",
        body: "You must provide a complete delivery address. Delivery windows are estimates, not guarantees. Risk in the goods passes to you when the order is handed over at the stated address.",
      },
      {
        heading: "Cancellations",
        body: "You may request cancellation while an order is still pending. Once packing or dispatch has started, cancellation may not be possible. Refunds, where due, follow the payment method used.",
      },
      {
        heading: "Acceptable use",
        body: "Do not misuse the app, scrape the catalogue, or place orders you do not intend to receive. We may suspend accounts that abuse promotions or disrupt operations.",
      },
    ],
  },
  Privacy: {
    title: "Privacy Policy",
    intro:
      "Sainik Mart collects only what we need to run the store: your account, cart, addresses, and orders. We do not sell your personal data.",
    sections: [
      {
        heading: "What we collect",
        body: "When you register we store your name, email, phone, and password hash. Guest carts stay on your device until you sign in. After login we store cart lines, delivery addresses, and order history so you can check out and track deliveries.",
      },
      {
        heading: "How we use it",
        body: "We use this information to fulfil orders, show you your cart and past purchases, contact you about a delivery, and keep the app secure. Support messages you send from Contact Us go to our inbox via your mail app.",
      },
      {
        heading: "Sharing",
        body: "We share order and address details with delivery partners only as needed to complete a delivery. We do not sell lists of customers. Legal requests may require us to disclose data when the law requires it.",
      },
      {
        heading: "Retention and your choices",
        body: "You can update addresses in the app and sign out at any time. Guest cart data lives on your device. To correct account details or ask us to delete an account, use Contact Us. We keep order records as required for accounts and tax.",
      },
    ],
  },
};
