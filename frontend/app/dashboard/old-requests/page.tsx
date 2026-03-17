"use client";

import { useEffect, useState, useCallback } from "react";
import { api, formatDate, statusBadge } from "@/lib/api";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

const statusArabic: any = {
    "Pending": "قيد الانتظار",
    "In Progress": "قيد التنفيذ",
    "Resolved": "تم الحل",
    "Rejected": "مرفوض",
};

const cities = ["دسوق", "فوة", "مطوبس"];
const ministries = [
    "رئاسة مجلس الوزراء", "وزارة الدفاع والإنتاج الحربى", "وزارة الإنتاج الحربى",
    "وزارة البترول والثروة المعدنية", "وزارة الكهرباء والطاقة المتجددة", "وزارة الخارجية",
    "وزارة البيئة", "وزارة الإتصالات وتكنولوجيا المعلومات", "وزارة التربية والتعليم",
    "وزارة القوى العاملة", "وزارة العدل", "وزارة التنمية المحلية",
    "وزارة الإسكان والمرافق والمجتمعات العمرانية", "وزارة الأوقاف", "وزارة الداخلية",
    "وزارة التجارة والصناعة", "وزارة المالية", "وزارة الطيران المدنى", "وزارة النقل",
    "وزارة الثقافة", "وزارة الصحة والسكان", "وزارة الموارد المائية والرى", "وزارة الزراعة",
    "وزارة التعاون الدولى", "وزارة التخطيط والتنمية الإقتصادية",
    "وزارة التعليم العالى والبحث العلمى", "وزارة التموين والتجارة الداخلية",
    "وزارة السياحة والآثار", "وزارة الشباب والرياضة", "وزارة شئون المجالس النيابية",
    "وزارة التضامن الإجتماعى", "وزارة الدولة للهجرة وشئون المصريين بالخارج",
    "وزارة قطاع الأعمال العام",
];
const requestTypes = ["شكوى", "طلب مساعدة أو دعم", "اقتراح", "أخرى"];

const selectCls = "px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right cursor-pointer";
const inputCls = "px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right placeholder-gray-400 w-full";

// ── Add Modal ──────────────────────────────────────────────────────────────────
function AddModal({ statuses, onClose, onSaved }: { statuses: any[]; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({
        citizen_name: "", national_id: "", phone: "", problem_type: "",
        ministry: "", city: "", notes: "", request_date: new Date().toISOString().split("T")[0], status_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, "pending" | "uploading" | "done" | "error">>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const submit = async () => {
        if (!form.citizen_name || !form.national_id || !form.problem_type || !form.city) {
            setError("يرجى ملء الحقول المطلوبة: الاسم، الرقم القومي، نوع الطلب، المركز");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // 1. Create the record
            const created = await api.post("/old-requests", form);
            const newId = created.data.id;

            // 2. Upload each file via presigned URL
            if (files.length > 0) {
                const progress: Record<string, "pending" | "uploading" | "done" | "error"> = {};
                files.forEach(f => { progress[f.name] = "pending"; });
                setUploadProgress({ ...progress });

                await Promise.all(files.map(async (file) => {
                    try {
                        setUploadProgress(p => ({ ...p, [file.name]: "uploading" }));

                        // Get presigned URL
                        const presignRes = await api.post(`/old-requests/${newId}/attachments/presign`, {
                            content_type: file.type,
                        });
                        const { uploadUrl } = presignRes.data;

                        // Upload directly to S3
                        await fetch(uploadUrl, {
                            method: "PUT",
                            body: file,
                            headers: { "Content-Type": file.type },
                        });

                        setUploadProgress(p => ({ ...p, [file.name]: "done" }));
                    } catch {
                        setUploadProgress(p => ({ ...p, [file.name]: "error" }));
                    }
                }));
            }

            onSaved();
            onClose();
        } catch (e: any) {
            setError(e.message || "حدث خطأ");
        } finally {
            setLoading(false);
        }
    };


    const fieldCls = "w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right";
    const selectFieldCls = "w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right cursor-pointer";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-navy text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <h2 className="font-amiri text-xl font-bold">إضافة طلب قديم</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                            <span>⚠️</span><span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">الاسم بالكامل *</label>
                            <input value={form.citizen_name} onChange={e => set("citizen_name", e.target.value)} placeholder="أحمد محمد علي" className={fieldCls} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">الرقم القومي *</label>
                            <input value={form.national_id} onChange={e => set("national_id", e.target.value)} placeholder="14 رقمًا" maxLength={14} className={`${fieldCls} font-mono`} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">رقم الموبايل</label>
                            <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01xxxxxxxxx" className={fieldCls} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">تاريخ الطلب</label>
                            <input type="date" value={form.request_date} onChange={e => set("request_date", e.target.value)} className={fieldCls} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">المركز *</label>
                            <select value={form.city} onChange={e => set("city", e.target.value)} className={selectFieldCls}>
                                <option value="">اختر المركز</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">نوع الطلب *</label>
                            <select value={form.problem_type} onChange={e => set("problem_type", e.target.value)} className={selectFieldCls}>
                                <option value="">اختر نوع الطلب</option>
                                {requestTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">الوزارة المعنية</label>
                            <select value={form.ministry} onChange={e => set("ministry", e.target.value)} className={selectFieldCls}>
                                <option value="">اختر الوزارة</option>
                                {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">الحالة</label>
                            <select value={form.status_id} onChange={e => set("status_id", e.target.value)} className={selectFieldCls}>
                                <option value="">قيد الانتظار (افتراضي)</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{statusArabic[s.name] || s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">ملاحظات</label>
                            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="أي ملاحظات إضافية..." className={`${fieldCls} resize-y`} />
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">مرفقات (اختياري)</label>
                            <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:border-blue hover:bg-blue-faint transition-all duration-200">
                                <span className="text-2xl">📁</span>
                                <span className="text-sm text-gray-500 font-medium">اضغط لاختيار ملفات</span>
                                <span className="text-xs text-gray-400">jpg, png, pdf, doc — حتى 10 ميجابايت</span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {/* File list */}
                            {files.length > 0 && (
                                <div className="flex flex-col gap-2 mt-1">
                                    {files.map((file, i) => {
                                        const status = uploadProgress[file.name];
                                        return (
                                            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-base shrink-0">
                                                        {file.type.includes("pdf") ? "📄" : file.type.includes("image") ? "🖼️" : "📝"}
                                                    </span>
                                                    <span className="truncate text-gray-700 font-medium">{file.name}</span>
                                                    <span className="text-gray-400 shrink-0 text-xs">
                                                        ({(file.size / 1024).toFixed(0)} KB)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {status === "uploading" && <span className="text-blue text-xs animate-pulse">جارٍ الرفع...</span>}
                                                    {status === "done" && <span className="text-emerald-600 text-xs font-semibold">✓ تم</span>}
                                                    {status === "error" && <span className="text-red-500 text-xs font-semibold">✗ فشل</span>}
                                                    {!status && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(i)}
                                                            className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="flex-1 py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <><span className="animate-spin">⏳</span> جارٍ الحفظ...</> : <>💾 حفظ الطلب</>}
                        </button>
                        <button onClick={onClose} className="px-6 py-3 border border-border rounded-xl text-text-secondary hover:bg-gray-50 transition-colors font-semibold text-sm">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OldRequestsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const [filterStatus, setFilterStatus] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterMinistry, setFilterMinistry] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterNationalId, setFilterNationalId] = useState("");

    const router = useRouter();
    useEffect(() => {
        api.get("/statuses").then(r => setStatuses(r.data)).catch(() => { });
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
            const res = await api.get(`/old-requests?${params.toString()}`);
            setPosts(res.data);
            setTotal(res.total);
            setPage(currentPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterCity, filterType, filterMinistry, filterName, filterNationalId]);

    useEffect(() => {
        const t = setTimeout(() => loadPosts(1), 400);
        return () => clearTimeout(t);
    }, [filterStatus, filterCity, filterType, filterMinistry, filterName, filterNationalId, loadPosts]);

    const clearFilters = () => {
        setFilterStatus(""); setFilterCity(""); setFilterType("");
        setFilterMinistry(""); setFilterName(""); setFilterNationalId("");
    };

    const fetchAll = async () => {
        const params = new URLSearchParams({ page: "1", limit: "9999" });
        if (filterStatus) params.set("status_id", filterStatus);
        if (filterCity) params.set("city", filterCity);
        if (filterType) params.set("problem_type", filterType);
        if (filterMinistry) params.set("ministry", filterMinistry);
        if (filterName) params.set("name", filterName);
        if (filterNationalId) params.set("national_id", filterNationalId);
        const res = await api.get(`/old-requests?${params.toString()}`);
        return res.data as any[];
    };

    const exportExcel = async () => {
        const all = await fetchAll();
        const rows = all.map(p => ({
            "#": p.id,
            "المواطن": p.citizen_name,
            "الرقم القومي": p.national_id,
            "الموبايل": p.phone || "—",
            "نوع الطلب": p.problem_type,
            "الوزارة": p.ministry || "—",
            "المركز": p.city,
            "الحالة": statusArabic[p.status] || p.status || "—",
            "تاريخ الطلب": p.request_date ? new Date(p.request_date).toLocaleDateString("ar-EG") : "—",
            "ملاحظات": p.notes || "—",
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "الطلبات القديمة");
        XLSX.writeFile(wb, "الطلبات_القديمة.xlsx");
    };

    const exportPDF = async () => {
        const all = await fetchAll();
        const rows = all.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>${p.citizen_name}</td>
                <td style="font-family:monospace">${p.national_id}</td>
                <td>${p.problem_type}</td>
                <td>${p.ministry || "—"}</td>
                <td>${p.city}</td>
                <td>${statusArabic[p.status] || p.status || "—"}</td>
                <td>${p.request_date ? new Date(p.request_date).toLocaleDateString("ar-EG") : "—"}</td>
            </tr>`).join("");

        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
            <title>الطلبات القديمة</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Cairo',sans-serif; direction:rtl; padding:32px; color:#1e293b; }
                h1 { font-size:22px; font-weight:700; margin-bottom:6px; color:#1e3a8a; }
                p { font-size:13px; color:#64748b; margin-bottom:20px; }
                table { width:100%; border-collapse:collapse; font-size:12px; }
                thead { background:#1e3a8a; color:white; }
                th { padding:10px 12px; text-align:right; font-weight:600; }
                td { padding:9px 12px; border-bottom:1px solid #e2e8f0; }
                tr:nth-child(even) { background:#f8fafc; }
            </style></head><body>
            <h1>الطلبات القديمة</h1>
            <p>إجمالي الطلبات: ${all.length}</p>
            <table><thead><tr>
                <th>#</th><th>المواطن</th><th>الرقم القومي</th>
                <th>نوع الطلب</th><th>الوزارة</th><th>المركز</th>
                <th>الحالة</th><th>تاريخ الطلب</th>
            </tr></thead><tbody>${rows}</tbody></table>
            </body></html>`);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); };
    };

    const totalPages = Math.ceil(total / 20);

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto min-h-screen" dir="rtl">
            {showAdd && <AddModal statuses={statuses} onClose={() => setShowAdd(false)} onSaved={() => loadPosts(1)} />}

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-navy mb-1">الطلبات القديمة</h1>
                    <p className="text-text-secondary">الأرشيف (إجمالي: {total})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-white font-bold text-sm hover:bg-navy/90 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة طلب
                    </button>
                    <button onClick={exportExcel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:-translate-y-0.5 transition-all duration-200">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Excel
                    </button>
                    <button onClick={exportPDF} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:-translate-y-0.5 transition-all duration-200">
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
            <div className="mb-6 bg-white p-5 rounded-xl shadow-blue-form border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <input placeholder="البحث بالاسم" value={filterName} onChange={e => setFilterName(e.target.value)} className={inputCls} />
                    <input placeholder="الرقم القومي" value={filterNationalId} onChange={e => setFilterNationalId(e.target.value)} className={`${inputCls} font-mono`} />
                    <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)} className={`${selectCls} w-full bg-gray-50`}>
                        <option value="">كل الوزارات</option>
                        {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${selectCls} w-full bg-gray-50`}>
                        <option value="">كل الحالات</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{statusArabic[s.name] || s.name}</option>)}
                    </select>
                    <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className={`${selectCls} w-full bg-gray-50`}>
                        <option value="">كل المراكز</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`${selectCls} w-full bg-gray-50`}>
                        <option value="">كل أنواع الطلبات</option>
                        {requestTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={clearFilters} className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-text-secondary hover:border-red-300 hover:text-red-500 hover:bg-red-50 font-semibold text-sm transition-all duration-200">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        مسح الفلاتر
                    </button>
                </div>
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
                                <th className="px-6 py-4 font-semibold">نوع الطلب</th>
                                <th className="px-6 py-4 font-semibold">الوزارة</th>
                                <th className="px-6 py-4 font-semibold">المركز</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">الحالة</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">تاريخ الطلب</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-blue font-bold text-lg animate-pulse">جارٍ التحميل...</td></tr>
                            ) : posts.length > 0 ? posts.map(p => (
                                <tr
                                    key={p.id}
                                    onClick={() => router.push(`/dashboard/old-requests/${p.id}`)}
                                    className="border-b border-gray-100 hover:bg-blue-faint cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-bold text-navy">#{p.id}</td>
                                    <td className="px-6 py-4 font-bold text-navy whitespace-nowrap">{p.citizen_name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-text-secondary tracking-wider">{p.national_id}</td>
                                    <td className="px-6 py-4 text-text-secondary">{p.problem_type}</td>
                                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.ministry || "—"}</td>
                                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{p.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: statusBadge(p.status, statusArabic[p.status] || "—") }} />
                                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                        {p.request_date ? new Date(p.request_date).toLocaleDateString("ar-EG") : "—"}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-text-muted">
                                    <div className="text-4xl mb-3">📭</div>
                                    لا توجد طلبات قديمة
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button onClick={() => loadPosts(page - 1)} disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-white text-navy disabled:opacity-50 hover:bg-gray-50">‹</button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
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