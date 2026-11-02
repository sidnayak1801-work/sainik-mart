import { Smartphone } from "lucide-react";
import { appConfig } from "../config/appConfig";
import { hasApkDownload, hasPlayStoreListing } from "../lib/install";
import InstallButton from "./InstallButton";

export default function AppDownload() {
  const androidReady = hasApkDownload() || hasPlayStoreListing();

  return (
    <section id="download" className="bg-canvas px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] bg-primary-dark text-white shadow-xl sm:rounded-[2rem]">
        <div className="grid items-center gap-8 px-5 py-10 sm:gap-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Get the app</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Your Everyday Shopping Starts Here.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
              Download Sainik Mart and make everyday shopping easier.
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center">
              <InstallButton
                label="Install Sainik Mart"
                variant="light"
                className="w-full px-6 py-3 text-[15px] sm:w-auto"
              />
              <span className="inline-flex items-center gap-2 text-sm text-white/80">
                <Smartphone size={16} />
                {androidReady ? "Available on Android" : "Android — coming soon"}
              </span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-primary p-6">
              <img
                src="/images/logo.png"
                alt={`${appConfig.appName} logo`}
                width={88}
                height={88}
                className="h-[88px] w-[88px] rounded-full shadow-lg"
              />
              <p className="mt-5 text-xl font-bold">{appConfig.appName}</p>
              <p className="mt-1 text-sm text-white/70">{appConfig.tagline}</p>
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                Browse as a guest, add items to your cart, and check out when you are ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
