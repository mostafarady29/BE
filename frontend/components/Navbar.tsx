"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "الرئيسية", href: "/" },
  { label: "الخدمات", href: "/#services" },
  { label: "الأخبار", href: "/#news" },
  { label: "تتبع الطلب", href: "/track" },
  { label: "دخول الموظفين", href: "/login" },
];

export const Navbar = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-100 bg-white border-b border-border shadow-[0_1px_12px_rgba(30,111,168,0.07)]">
      <div className="max-w-container mx-auto px-4 sm:px-8 flex items-center justify-between h-17.5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div>
            <div className="font-amiri text-[1.15rem] font-bold text-blue leading-tight">
              النائب / عادل النجار
            </div>
            <div className="text-[0.7rem] text-text-muted font-medium tracking-wide">
              عضو مجلس الشعب
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1 w-9 h-9 rounded-md bg-blue-faint hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="القائمة"
        >
          <span
            className={`h-0.5 w-5 bg-blue transition-transform duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
          />
          <span
            className={`h-0.5 w-5 bg-blue transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`h-0.5 w-5 bg-blue transition-transform duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          />
        </button>

        {/* Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="nav-link relative px-[1.1rem] py-[0.45rem] text-text-secondary text-[0.88rem] font-semibold no-underline transition-colors duration-200 hover:text-blue"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {link.label}
              <span
                className={`nav-underline transition-transform duration-250 ease-in-out ${
                  hovered === i ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          ))}

          <Link
            href="/#footer"
            className="navbar-cta mr-2 px-[1.3rem] py-2 bg-gradient-crimson-navy text-white no-underline text-[0.88rem] font-bold rounded shadow-blue-md transition-all duration-200"
          >
            تواصل معنا
          </Link>
        </div>
      </div>

      {/* Links - Mobile */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-blue-md overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-96 border-t border-border-light"
            : "max-h-0 border-transparent border-t-0"
        }`}
      >
        <div className="flex flex-col px-4 pt-2 pb-5 gap-2">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="px-4 py-3 text-text-primary text-[0.95rem] font-semibold border-b border-border-light hover:text-blue hover:bg-blue-faint rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#footer"
            className="mt-3 mx-2 text-center py-3 bg-gradient-crimson-navy text-white no-underline text-[0.95rem] font-bold rounded-lg shadow-blue-sm transition-opacity hover:opacity-90"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </nav>
  );
};
