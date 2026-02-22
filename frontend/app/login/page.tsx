"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        auth.redirectIfLoggedIn();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/auth/login", { username, password });
            auth.save(res.token, res.user);

            // check redirect
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get("redirect") || "/dashboard";
            window.location.href = redirect;
        } catch (err: any) {
            setError(err.message || "فشلت عملية تسجيل الدخول");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-faint to-surface px-4" dir="rtl">
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-blue-crimson rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(139,26,46,0.2)] mb-4">
                        🏛️
                    </div>
                </div>

                <div className="bg-white p-10 rounded-2xl shadow-blue-form border border-gray-100">
                    <h2 className="text-2xl font-bold font-amiri text-navy mb-2">دخول موظفي المكتب</h2>
                    <p className="text-text-secondary text-sm mb-8">أدخل بياناتك للوصول إلى لوحة التحكم</p>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-5">
                            <label className="block text-sm font-semibold mb-2">اسم المستخدم</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="username"
                                autoComplete="username"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue bg-gray-50 text-right leading-none transition-colors"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue bg-gray-50 text-right leading-none transition-colors font-sans"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-blue-crimson text-white py-3.5 rounded-xl font-bold shadow-blue-md hover:-translate-y-0.5 transition-transform disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <a href="/" className="text-sm text-text-muted hover:text-blue transition-colors">
                        ← العودة للموقع العام
                    </a>
                </div>
            </div>
        </div>
    );
}
