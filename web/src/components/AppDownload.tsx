import { Smartphone } from "lucide-react";
import { appConfig } from "../config/appConfig";
import { hasApkDownload, hasPlayStoreListing } from "../lib/install";
import InstallButton from "./InstallButton";

export default function AppDownload() {
  const androidReady = hasApkDownload() || hasPlayStoreListing();

  return (
    <section id="download" className="bg-canvas px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary-dark text-white shadow-xl">
        <div className="grid items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Get the app</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your Everyday Shopping Starts Here.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
              Download Sainik Mart and make everyday shopping easier.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <InstallButton
                label="Install Sainik Mart"
                variant="light"
                className="px-6 py-3 text-[15px]"
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
