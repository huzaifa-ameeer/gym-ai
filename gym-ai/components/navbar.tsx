"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { buttonClass } from "@/components/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { label: "Home", href: "#home" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

const HEADER_OFFSET = 64;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function handleSectionClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    setOpen(false);

    if (!isHome) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
    );
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md"
      }`}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <a
          href={isHome ? "#home" : "/"}
          aria-label="GymAI home"
          className="flex shrink-0 items-center rounded-lg"
          onClick={(event) => handleSectionClick(event, "#home")}
        >
          <Logo />
        </a>

        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={isHome ? link.href : `/${link.href}`}
              onClick={(event) => handleSectionClick(event, link.href)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-accent-soft hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="/login" className={`${buttonClass()} hidden lg:inline-flex`}>
            Login
          </a>
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
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav
            aria-label="Mobile"
            className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 pb-6 pt-2 sm:px-6"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={isHome ? link.href : `/${link.href}`}
                onClick={(event) => handleSectionClick(event, link.href)}
                className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors duration-200 hover:bg-accent-soft"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className={`${buttonClass({ size: "lg", full: true })} mt-3`}
            >
              Login
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
