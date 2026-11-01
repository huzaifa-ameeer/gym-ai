"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/toast";

const links = [
  { label: "Home", href: "#home" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

type Viewer = {
  name: string;
  email: string;
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [resolved, setResolved] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: Viewer } | null) => {
        if (!active) return;
        setViewer(data?.user ?? null);
        setResolved(true);
      })
      .catch(() => {
        if (!active) return;
        setViewer(null);
        setResolved(true);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Could not sign out.");
      }

      setViewer(null);
      toast({
        variant: "success",
        title: "Signed out",
        description: "Your session has ended.",
      });
      router.replace("/");
    } catch {
      toast({
        variant: "error",
        title: "Could not sign out",
        description: "Check your connection and try again.",
      });
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 cursor-default bg-background/40 backdrop-blur-lg transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-black/50 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-line bg-background/85 backdrop-blur-xl"
            : "border-transparent bg-background/70 backdrop-blur-md"
        }`}
      >
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link
          href={isHome ? "#home" : "/"}
          aria-label="GymAI home"
          className="flex shrink-0 items-center rounded-lg"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={isHome ? link.href : `/${link.href}`}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-accent-soft hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 lg:flex">
            {viewer ? (
              <>
                <span
                  className="max-w-40 truncate text-sm font-medium text-foreground"
                  title={viewer.name}
                >
                  {firstName(viewer.name)}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={buttonClass({ variant: "secondary" })}
                >
                  Logout
                </button>
              </>
            ) : resolved ? (
              <Link href="/login" className={buttonClass()}>
                Login
              </Link>
            ) : null}
          </div>
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors duration-200 hover:bg-accent-soft hover:text-accent-ink lg:hidden"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-full z-50 origin-top overflow-hidden rounded-b-2xl border-b border-line bg-background/95 shadow-2xl shadow-black/15 backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none supports-[backdrop-filter]:bg-background/55 dark:bg-[#060807] lg:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-white/15 to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
        />
        <nav
          aria-label="Mobile"
          className="relative mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 pb-6 pt-2 sm:px-6"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={isHome ? link.href : `/${link.href}`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors duration-200 hover:bg-accent-soft"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-line pt-4">
            {viewer ? (
              <div className="space-y-3">
                <p className="px-1 text-sm text-muted">
                  Signed in as{" "}
                  <span className="font-medium text-foreground">
                    {firstName(viewer.name)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={buttonClass({
                    size: "lg",
                    full: true,
                    variant: "secondary",
                  })}
                >
                  Logout
                </button>
              </div>
            ) : resolved ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={buttonClass({ size: "lg", full: true })}
              >
                Login
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
    </>
  );
}
