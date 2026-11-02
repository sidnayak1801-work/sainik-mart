import { CreditCard, Package, ShoppingBag, Smartphone, Truck, UtensilsCrossed, type LucideIcon } from "lucide-react";

const features: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Everyday Essentials",
    body: "Find the products you need for your everyday life.",
    icon: UtensilsCrossed,
  },
  {
    title: "Easy Shopping",
    body: "Browse products and place orders conveniently.",
    icon: ShoppingBag,
  },
  {
    title: "Convenient Delivery",
    body: "Get your orders delivered to your doorstep.",
    icon: Truck,
  },
  {
    title: "Simple Payments",
    body: "Enjoy the available payment options during checkout.",
    icon: CreditCard,
  },
  {
    title: "Easy Order Tracking",
    body: "Stay informed about your order.",
    icon: Package,
  },
  {
    title: "User-Friendly Experience",
    body: "Enjoy a simple and convenient shopping experience.",
    icon: Smartphone,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Why Sainik Mart?</p>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold tracking-tight text-primary-dark sm:text-3xl lg:text-4xl">
          Everything You Need, All in One Place.
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-line bg-canvas p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
