"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!auth.guard()) return;
        setMounted(true);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (!mounted) return null;

    const user = auth.getUser();
    const isAdmin = auth.isAdmin();

    const links = [
        { href: "/dashboard", icon: "📊", label: "لوحة التحكم" },
        { href: "/dashboard/posts", icon: "📋", label: "الطلبات" },
        { href: "/dashboard/old-requests", icon: "🗂️", label: "الطلبات القديمة" },
        { href: "/dashboard/news", icon: "📰", label: "الأخبار" },
        ...(isAdmin ? [{ href: "/dashboard/users", icon: "👥", label: "الموظفون" }] : []),
    ];

    return (
        <div className="flex min-h-screen bg-surface" dir="rtl">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-navy text-white flex flex-col fixed inset-y-0 right-0 z-50 shadow-2xl
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}>
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <Link href="/" className="w-10 h-10 bg-gradient-blue-crimson rounded-lg flex items-center justify-center text-xl shadow-lg">
                        🏛️
                    </Link>
                    <span className="font-bold font-amiri text-xl">مكتب النائب</span>
                </div>

                <div className="px-6 py-4 text-xs font-semibold text-white/50 tracking-wider">
                    القائمة الرئيسية
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-1">
                    {links.map((link) => {
                        const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                    ? "bg-blue text-white shadow-blue-md font-bold"
                                    : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
                                    }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="mb-4 px-2">
                        <div className="font-bold text-sm text-white">{user?.username}</div>
                        <div className="text-xs text-blue-light capitalize mt-0.5">{user?.role}</div>
                    </div>
                    <button
                        onClick={() => auth.logout()}
                        className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:mr-64 min-w-0 w-full">
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-30 bg-navy text-white px-4 py-3 flex items-center justify-between shadow-md">
                    <span className="font-bold font-amiri text-lg">مكتب النائب</span>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="فتح القائمة"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {children}
            </main>
        </div>
    );
}