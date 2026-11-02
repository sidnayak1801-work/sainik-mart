import { Download, Search, ShoppingCart, type LucideIcon } from "lucide-react";

const steps: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Download the App",
    body: "Install Sainik Mart on your Android device.",
    icon: Download,
  },
  {
    title: "Browse Products",
    body: "Explore available products and add your essentials to the cart.",
    icon: Search,
  },
  {
    title: "Place Your Order",
    body: "Complete checkout and enjoy convenient shopping.",
    icon: ShoppingCart,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">How it works</p>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold tracking-tight text-primary-dark sm:text-3xl lg:text-4xl">
          Three steps to your next shop
        </h2>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-3xl border border-line bg-canvas p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-bold text-gold">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
