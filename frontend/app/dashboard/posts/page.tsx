"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, formatDate, statusBadge } from "@/lib/api";

export default function PostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [statuses, setStatuses] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterType, setFilterType] = useState("");

    const [loading, setLoading] = useState(true);

    // Load Statuses once
    useEffect(() => {
        api.get("/statuses").then((res) => setStatuses(res.data)).catch(() => { });
    }, []);

    const loadPosts = useCallback(async (currentPage: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage.toString(), limit: "20" });
            if (filterStatus) params.set("status_id", filterStatus);
            if (filterCity) params.set("city", filterCity);
            if (filterType) params.set("problem_type", filterType);

            const res = await api.get(`/posts?${params.toString()}`);
            setPosts(res.data);
            setTotal(res.total);
            setPage(currentPage);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterCity, filterType]);

    // Debounced load
    useEffect(() => {
        const timer = setTimeout(() => {
            loadPosts(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [filterStatus, filterCity, filterType, loadPosts]);

    const clearFilters = () => {
        setFilterStatus("");
        setFilterCity("");
        setFilterType("");
    };

    const totalPages = Math.ceil(total / 20);

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-amiri text-navy mb-1">الطلبات والشكاوى</h1>
                    <p className="text-text-secondary">جميع الطلبات (إجمالي: {total})</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-blue-form border border-border">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right"
                >
                    <option value="">كل الحالات</option>
                    {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>

                <input
                    placeholder="البحث بالمدينة"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right placeholder-gray-400 w-48"
                />

                <input
                    placeholder="نوع المشكلة"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right placeholder-gray-400 w-48"
                />

                <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors mr-auto"
                >
                    مسح الفلاتر
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-text-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold">المواطن</th>
                                <th className="px-6 py-4 font-semibold">الرقم القومي</th>
                                <th className="px-6 py-4 font-semibold">نوع المشكلة</th>
                                <th className="px-6 py-4 font-semibold">المدينة</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">الحالة</th>
                                <th className="px-6 py-4 font-semibold">المسؤول</th>
                                <th className="px-6 py-4 font-semibold">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-blue font-bold text-lg animate-pulse">
                                        جارٍ التحميل...
                                    </td>
                                </tr>
                            ) : posts.length > 0 ? (
                                posts.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => router.push(`/dashboard/posts/${p.id}`)}
                                        className="border-b border-gray-100 hover:bg-blue-faint cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-navy">#{p.id}</td>
                                        <td className="px-6 py-4 font-bold text-navy text-nowrap">{p.citizen_name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-text-secondary tracking-wider">{p.national_id}</td>
                                        <td className="px-6 py-4 text-text-secondary">{p.problem_type}</td>
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.city}</td>
                                        <td className="px-6 py-4 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: statusBadge(p.status) }} />
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.assigned_to || "—"}</td>
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{formatDate(p.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-text-muted">
                                        <div className="text-4xl mb-3">📭</div>
                                        لا توجد طلبات تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => loadPosts(page - 1)}
                        disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-navy disabled:opacity-50 hover:bg-gray-50"
                    >
                        ‹
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => loadPosts(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${p === page
                                    ? "bg-blue text-white border-blue shadow-blue-sm font-bold"
                                    : "border-border bg-white text-navy hover:bg-gray-50"
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => loadPosts(page + 1)}
                        disabled={page === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-navy disabled:opacity-50 hover:bg-gray-50"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}
