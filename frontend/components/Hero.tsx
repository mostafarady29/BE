"use client";

import { GEO_SVG } from "@/constants/colors";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => (
  <section id="about" className="relative bg-white overflow-hidden">
    {/* Left diagonal panel */}
    <div className="absolute top-0 left-0 bottom-0 w-[42%] clip-hero-panel bg-gradient-hero-panel z-0" />

    {/* Geo pattern over left panel */}
    <div
      className="absolute top-0 left-0 bottom-0 w-[42%] opacity-60 z-1"
      style={{ backgroundImage: GEO_SVG, backgroundSize: "56px 56px" }}
    />

    {/* Right border accent */}
    <div className="absolute top-0 right-0 w-0.75 h-full opacity-35 bg-linear-to-b from-transparent via-blue to-transparent" />

    {/* Top rule */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-section-top" />

    <div className="relative z-2 max-w-container mx-auto px-4 sm:px-8 py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* ── Text Side ── */}
      <div className="order-last lg:order-first text-center lg:text-right flex flex-col items-center lg:items-start">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-faint border border-border text-blue text-[0.75rem] font-semibold tracking-[0.08em] uppercase px-5 py-[0.4rem] rounded-full mb-7 shadow-blue-sm">
          <span className="w-2 h-2 rounded-full bg-blue shrink-0" />
          عضو مجلس الشعب — الفترة البرلمانية الحالية
        </div>

        {/* Name */}
        <h1 className="font-amiri text-hero font-bold text-text-primary leading-[1.2] mb-2">
          النائب
          <br />
          <span className="text-gradient-blue mt-1">عادل النجار</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[1.1rem] text-blue font-semibold border-r-4 border-blue pr-5 mb-6 leading-normal">
          دائرة دسوق · فوه · مطوبس
        </p>

        <p className="text-text-secondary text-[1rem] leading-[1.9] mb-10 max-w-[90%]">
          نعمل معًا لخدمة المواطنين وتحقيق التنمية المستدامة، هدفنا تلبية
          احتياجات أهل الدائرة بسرعة وشفافية.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
          <Link
            href="/request"
            className="hero-btn-primary px-9 py-[0.9rem] bg-gradient-crimson-navy text-white no-underline font-bold text-[1rem] rounded-full shadow-blue-md transition-all duration-200 inline-block"
          >
            قدم طلبك الان
          </Link>
          <Link
            href="/track"
            className="hero-btn-outline px-9 py-[0.9rem] bg-transparent border-2 border-blue text-blue no-underline font-semibold text-[1rem] rounded-full inline-block transition-all duration-200"
          >
            تابع طلبك
          </Link>
        </div>
      </div>
      {/* ── Photo Side ── */}
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* ── Logo Badge 1 — Top-left: مجلس النواب المصري ── */}
          <div
            className="absolute -top-8 -left-12 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-blue/15 rounded-2xl px-4 py-3 shadow-[0_8px_32px_-4px_rgba(0,56,147,0.18)] min-w-40"
            style={{ direction: "rtl" }}
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-faint border border-blue/20 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo-min.png"
                alt="شعار مجلس النواب"
                width={36}
                height={36}
                className="object-contain w-9 h-9"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.78rem] font-bold text-text-primary font-amiri leading-snug">
                مجلس النواب المصري
              </span>
            </div>
          </div>

          {/* ── Logo Badge 2 — Bottom-right: second logo ── */}
          <div className="absolute -bottom-10 -right-5 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-blue/15 rounded-2xl p-3 shadow-[0_8px_32px_-4px_rgba(0,56,147,0.18)]">
            <div className="w-12 h-12 rounded-xl bg-blue-faint border border-blue/20 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo-hezb.png"
                alt="حزب مستقبل وطن"
                width={44}
                height={44}
                className="object-contain w-11 h-11"
              />
            </div>
          </div>

          {/* ── Membership Badge — Bottom-center ── */}
          <div
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-navy/20 rounded-xl px-5 py-2.5 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.15)] w-max"
            style={{ direction: "rtl" }}
          >
            {/* Vertical gold/navy divider accent */}
            <div className="shrink-0 w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
              <span className="text-white text-sm">🏛️</span>
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-navy/15" />
            <div className="flex flex-col leading-tight">
              <span className="text-[0.58rem] text-navy/50 font-semibold tracking-[0.15em] uppercase">
                رقم العضوية
              </span>
              <span className="text-[1rem] font-black text-navy tracking-[0.2em] font-amiri">
                ١٠١
              </span>
            </div>
          </div>

          {/* ── Subtle glow ring behind photo ── */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-blue/10 via-transparent to-blue/5 blur-2xl scale-110 -z-10" />

          {/* ── The photo ── */}
          <Image
            src="/images/eng-adel-1.png"
            alt="النائب عادل النجار"
            width={400}
            height={500}
            className="w-full max-w-100 h-auto rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-4 border-white object-cover aspect-4/5 bg-white"
          />
        </div>
      </div>
    </div>
  </section>
);
