"use client";

import { GEO_SVG } from "@/constants/colors";
import Link from "next/link";

export const Footer = () => (
  <footer className="relative bg-navy pt-18 pb-8 overflow-hidden">
    {/* Top glow line */}
    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue to-transparent" />

    {/* Geo pattern */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{ backgroundImage: GEO_SVG, backgroundSize: "56px 56px" }}
    />

    <div className="relative z-1 max-w-container mx-auto px-8">
      {/* Three-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-10 lg:gap-14 pb-12 border-b border-white/6 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="font-amiri text-[1.35rem] font-bold text-blue-light">
              النائب / عادل النجار
            </span>
          </div>
          <p className="text-white/40 text-[0.88rem] leading-[1.9] max-w-67.5">
            نعمل بتفانٍ لخدمة المواطنين وتحقيق التنمية المستدامة في دائرة دسوق
            وفوه ومطوبس.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <div className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-blue mb-5">
            روابط سريعة
          </div>
          {[
            { label: "من نحن", href: "/#about" },
            { label: "الخدمات", href: "/#services" },
            { label: "الأخبار", href: "/#news" },
            { label: "تواصل معنا", href: "/#request-form" }
          ].map((l, i) => (
            <div key={i} className="mb-[0.6rem]">
              <Link href={l.href} className="footer-link">
                {l.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-blue mb-5">
            معلومات التواصل
          </div>
          {[
            { icon: "📍", text: "دائرة دسوق وفوه ومطوبس، محافظة كفر الشيخ" },
            { icon: "✉", text: "info@adel-elnagar.eg" },
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start mb-[0.85rem]">
              <div className="w-6 h-6 shrink-0 mt-px rounded-[3px] bg-blue/20 flex items-center justify-center text-[0.7rem] text-blue-light">
                {item.icon}
              </div>
              <span className="text-white/40 text-[0.85rem] leading-[1.6]">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center text-white/20 text-[0.78rem] tracking-[0.04em]">
        جميع الحقوق محفوظة © 2026 النائب عادل النجار
      </p>
    </div>
  </footer>
);
