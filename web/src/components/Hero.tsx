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
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Neighbourhood grocery, in your pocket
          </p>
          <h1 className="mt-3 max-w-xl text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-primary-dark sm:mt-4 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
            Your Daily Essentials, Delivered to Your Doorstep.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-base lg:text-lg">
            Shop groceries, fresh essentials and everyday products conveniently with Sainik
            Mart. Discover a simpler way to shop from your neighbourhood.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <InstallButton label="Install Sainik Mart" className="w-full px-6 py-3 text-[15px] sm:w-auto" />
            <a
              href="#features"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[15px] font-semibold text-primary-dark transition hover:border-primary/30 hover:bg-wash sm:w-auto"
            >
              Explore Benefits
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="flex justify-center overflow-hidden lg:justify-end">
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}
