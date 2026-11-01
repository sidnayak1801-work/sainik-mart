import { ArrowRight } from "lucide-react";
import InstallButton from "./InstallButton";
import PhoneMock from "./PhoneMock";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Neighbourhood grocery, in your pocket
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-dark sm:text-5xl">
            Your Daily Essentials, Delivered to Your Doorstep.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Shop groceries, fresh essentials and everyday products conveniently with Sainik
            Mart. Discover a simpler way to shop from your neighbourhood.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InstallButton label="Install Sainik Mart" className="px-6 py-3 text-[15px]" />
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[15px] font-semibold text-primary-dark transition hover:border-primary/30 hover:bg-wash"
            >
              Explore Benefits
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}
