import { appConfig } from "../config/appConfig";

const nav = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Why Sainik Mart?" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#download", label: "Download App" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_0.8fr_0.9fr]">
        <div>
          <a href="#home" className="inline-flex items-center gap-3">
            <img src="/images/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
            <span className="text-lg font-bold">{appConfig.appName}</span>
          </a>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {appConfig.brandDescription}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Explore</p>
          <ul className="mt-4 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm text-white/75 transition hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Contact &amp; legal</p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <a href={`mailto:${appConfig.contactEmail}`} className="hover:text-white">
                {appConfig.contactEmail}
              </a>
            </li>
            {appConfig.contactPhone ? (
              <li>
                <a href={`tel:${appConfig.contactPhone}`} className="hover:text-white">
                  {appConfig.contactPhone}
                </a>
              </li>
            ) : null}
            {appConfig.contactAddress ? <li>{appConfig.contactAddress}</li> : null}
            <li>
              <a href={appConfig.privacyUrl} className="hover:text-white" rel="noreferrer">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href={appConfig.termsUrl} className="hover:text-white" rel="noreferrer">
                Terms and Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/55 sm:px-6">
          © {year} {appConfig.appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
