"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, formatDate, statusBadge } from "@/lib/api";
import * as XLSX from "xlsx";

export default function PostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [statuses, setStatuses] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterNationalId, setFilterNationalId] = useState("");
    const [filterMinistry, setFilterMinistry] = useState("");

    const [loading, setLoading] = useState(false);

    const statusArabic: any = {
        "Pending": "قيد الانتظار",
        "In Progress": "قيد التنفيذ",
        "Resolved": "تم الحل",
        "Rejected": "مرفوض"
    };

    const cities = ["دسوق", "فوة", "مطوبس"];

    const ministries = [
        "رئاسة مجلس الوزراء",
        "وزارة الدفاع والإنتاج الحربى",
        "وزارة الإنتاج الحربى",
        "وزارة البترول والثروة المعدنية",
        "وزارة الكهرباء والطاقة المتجددة",
        "وزارة الخارجية",
        "وزارة البيئة",
        "وزارة الإتصالات وتكنولوجيا المعلومات",
        "وزارة التربية والتعليم",
        "وزارة القوى العاملة",
        "وزارة العدل",
        "وزارة التنمية المحلية",
        "وزارة الإسكان والمرافق والمجتمعات العمرانية",
        "وزارة الأوقاف",
        "وزارة الداخلية",
        "وزارة التجارة والصناعة",
        "وزارة المالية",
        "وزارة الطيران المدنى",
        "وزارة النقل",
        "وزارة الثقافة",
        "وزارة الصحة والسكان",
        "وزارة الموارد المائية والرى",
        "وزارة الزراعة",
        "وزارة التعاون الدولى",
        "وزارة التخطيط والتنمية الإقتصادية",
        "وزارة التعليم العالى والبحث العلمى",
        "وزارة التموين والتجارة الداخلية",
        "وزارة السياحة والآثار",
        "وزارة الشباب والرياضة",
        "وزارة شئون المجالس النيابية",
        "وزارة التضامن الإجتماعى",
        "وزارة الدولة للهجرة وشئون المصريين بالخارج",
        "وزارة قطاع الأعمال العام",
    ];

    const requestTypes = ["شكوى", "طلب مساعدة أو دعم", "اقتراح", "أخرى"];

    const selectCls = "px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right cursor-pointer";

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
            if (filterMinistry) params.set("ministry", filterMinistry);
            if (filterName) params.set("name", filterName);
            if (filterNationalId) params.set("national_id", filterNationalId);

            const res = await api.get(`/posts?${params.toString()}`);
            setPosts(res.data);
            setTotal(res.total);
            setPage(currentPage);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterCity, filterType, filterMinistry, filterName, filterNationalId]);

    useEffect(() => {
        const timer = setTimeout(() => loadPosts(1), 500);
        return () => clearTimeout(timer);
    }, [filterStatus, filterCity, filterType, filterMinistry, filterName, filterNationalId, loadPosts]);

    const clearFilters = () => {
        setFilterStatus("");
        setFilterCity("");
        setFilterType("");
        setFilterMinistry("");
        setFilterName("");
        setFilterNationalId("");
    };

    // 🆕 Fetch ALL posts (no pagination) for export
    const fetchAllForExport = async () => {
        const params = new URLSearchParams({ page: "1", limit: "9999" });
        if (filterStatus) params.set("status_id", filterStatus);
        if (filterCity) params.set("city", filterCity);
        if (filterType) params.set("problem_type", filterType);
        if (filterMinistry) params.set("ministry", filterMinistry);
        if (filterName) params.set("name", filterName);
        if (filterNationalId) params.set("national_id", filterNationalId);
        const res = await api.get(`/posts?${params.toString()}`);
        return res.data as any[];
    };

    // 🆕 Export to Excel
    const exportExcel = async () => {
        const all = await fetchAllForExport();
        const rows = all.map((p) => ({
            "#": p.id,
            "المواطن": p.citizen_name,
            "الرقم القومي": p.national_id,
            "نوع المشكلة": p.problem_type,
            "الوزارة": p.ministry || "—",
            "المدينة": p.city,
            "الحالة": statusArabic[p.status] || p.status,
            "المسؤول": p.assigned_to || "—",
            "التاريخ": formatDate(p.created_at),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
        XLSX.writeFile(wb, "الطلبات.xlsx");
    };

    // 🆕 Export to PDF
    const exportPDF = async () => {
        const all = await fetchAllForExport();

        const rows = all.map((p) => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.citizen_name}</td>
            <td style="font-family:monospace;letter-spacing:1px">${p.national_id}</td>
            <td>${p.problem_type}</td>
            <td>${p.ministry || "—"}</td>
            <td>${p.city}</td>
            <td>${statusArabic[p.status] || p.status}</td>
            <td>${p.assigned_to || "—"}</td>
            <td>${formatDate(p.created_at)}</td>
        </tr>
    `).join("");

        const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8"/>
            <title>الطلبات والشكاوى</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 32px; color: #1e293b; }
                h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #1e3a8a; }
                p { font-size: 13px; color: #64748b; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                thead { background: #1e3a8a; color: white; }
                th { padding: 10px 12px; text-align: right; font-weight: 600; }
                td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
                tr:nth-child(even) { background: #f8fafc; }
                tr:hover { background: #eff6ff; }
                @media print {
                    body { padding: 16px; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>الطلبات والشكاوى</h1>
            <p>إجمالي الطلبات: ${all.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المواطن</th>
                        <th>الرقم القومي</th>
                        <th>نوع المشكلة</th>
                        <th>الوزارة</th>
                        <th>المدينة</th>
                        <th>الحالة</th>
                        <th>المسؤول</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>
    `;

        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    const totalPages = Math.ceil(total / 20);

    return (
        <div className="p-8 max-w-350 mx-auto min-h-screen" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-amiri text-navy mb-1">الطلبات والشكاوى</h1>
                    <p className="text-text-secondary">جميع الطلبات (إجمالي: {total})</p>
                </div>
                {/* 🆕 Export Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={exportExcel}
                        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Excel
                    </button>
                    <button
                        onClick={exportPDF}
                        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white p-5 rounded-xl shadow-blue-form border border-border" dir="rtl">
                {/* Row 1 — text searches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <input
                        placeholder="البحث بالاسم"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right placeholder-gray-400 w-full"
                    />
                    <input
                        placeholder="الرقم القومي"
                        value={filterNationalId}
                        onChange={(e) => setFilterNationalId(e.target.value)}
                        className="px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right placeholder-gray-400 w-full font-mono"
                    />
                    {/* Ministry takes full remaining width on large screens */}
                    <select
                        value={filterMinistry}
                        onChange={(e) => setFilterMinistry(e.target.value)}
                        className={`${selectCls} w-full bg-gray-50`}
                    >
                        <option value="">كل الوزارات</option>
                        {ministries.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                {/* Row 2 — dropdowns + clear */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`${selectCls} w-full bg-gray-50`}
                    >
                        <option value="">كل الحالات</option>
                        {statuses.map(s => (
                            <option key={s.id} value={s.id}>{statusArabic[s.name] || s.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className={`${selectCls} w-full bg-gray-50`}
                    >
                        <option value="">كل المراكز</option>
                        {cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={`${selectCls} w-full bg-gray-50`}
                    >
                        <option value="">كل أنواع الطلبات</option>
                        {requestTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-text-secondary hover:border-red-300 hover:text-red-500 hover:bg-red-50 font-semibold text-sm transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        مسح الفلاتر
                    </button>
                </div>
            </div>

            {/* Table — unchanged except statusBadge fix */}
            <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-text-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold">المواطن</th>
                                <th className="px-6 py-4 font-semibold">الرقم القومي</th>
                                <th className="px-6 py-4 font-semibold">نوع المشكلة</th>
                                <th className="px-6 py-4 font-semibold">الوزارة</th>
                                <th className="px-6 py-4 font-semibold">المدينة</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">الحالة</th>
                                <th className="px-6 py-4 font-semibold">المسؤول</th>
                                <th className="px-6 py-4 font-semibold">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-blue font-bold text-lg animate-pulse">
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
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.ministry || "—"}</td>
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.city}</td>
                                        <td className="px-6 py-4 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: statusBadge(p.status, statusArabic[p.status]) }} />
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.assigned_to || "—"}</td>
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{formatDate(p.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-text-muted">
                                        <div className="text-4xl mb-3">📭</div>
                                        لا توجد طلبات تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination — unchanged */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button onClick={() => loadPosts(page - 1)} disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-navy disabled:opacity-50 hover:bg-gray-50">‹</button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => loadPosts(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${p === page ? "bg-blue text-white border-blue shadow-blue-sm font-bold" : "border-border bg-white text-navy hover:bg-gray-50"}`}>
                            {p}
                        </button>
                    ))}
                    <button onClick={() => loadPosts(page + 1)} disabled={page === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-navy disabled:opacity-50 hover:bg-gray-50">›</button>
                </div>
            )}
        </div>
    );
}