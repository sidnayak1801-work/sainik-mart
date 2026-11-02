import { useState } from "react";
import { Menu, X } from "lucide-react";
import { appConfig } from "../config/appConfig";
import InstallButton from "./InstallButton";

const links = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Why Sainik Mart?" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#download", label: "Download App" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6">
        <a href="#home" className="flex min-w-0 items-center gap-2.5">
          <img
            src="/images/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full shadow-sm"
          />
          <span className="truncate text-[15px] font-bold tracking-tight text-primary-dark">
            {appConfig.appName}
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <InstallButton variant="nav" className="px-3.5 sm:px-5" onNavigate={() => setOpen(false)} />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-primary-dark lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-canvas px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-wash"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
