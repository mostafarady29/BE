"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, formatDate, statusBadge } from "@/lib/api";

const statusArabic: any = {
    "Pending": "قيد الانتظار",
    "In Progress": "قيد التنفيذ",
    "Resolved": "تم الحل",
    "Rejected": "مرفوض",
};

export default function OldRequestDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [postRes, attachRes, statusRes] = await Promise.all([
                    api.get(`/old-requests/${id}`),
                    api.get(`/old-requests/${id}/attachments`),
                    api.get("/statuses"),
                ]);
                setData(postRes.data);
                setAttachments(attachRes.data || []);
                setStatuses(statusRes.data || []);
            } catch (e: any) {
                setError(e.message || "فشل تحميل البيانات");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const updateStatus = async (statusId: string) => {
        setStatusUpdating(true);
        try {
            await api.patch(`/old-requests/${id}/status`, { status_id: parseInt(statusId) });
            const res = await api.get(`/old-requests/${id}`);
            setData(res.data);
        } catch (e: any) {
            alert(e.message || "فشل تحديث الحالة");
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center p-10">
            <div className="text-xl animate-pulse text-blue font-bold">جارٍ التحميل...</div>
        </div>
    );

    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
                <span className="text-2xl">⚠️</span> {error}
            </div>
        </div>
    );

    const p = data;

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto" dir="rtl">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-navy font-semibold text-sm mb-6 transition-colors group"
            >
                <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                العودة إلى الطلبات القديمة
            </button>

            {/* Header card */}
            <div className="bg-navy text-white rounded-2xl px-6 py-5 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">طلب قديم</p>
                    <h1 className="font-amiri text-2xl font-bold">#{p.id} — {p.citizen_name}</h1>
                    <p className="text-white/60 text-sm mt-1">
                        تاريخ الطلب: {p.request_date ? new Date(p.request_date).toLocaleDateString("ar-EG") : "—"}
                    </p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: statusBadge(p.status_name, statusArabic[p.status_name] || p.status_name) }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — main info */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Citizen info */}
                    <div className="bg-white rounded-2xl border border-border shadow-blue-form p-6">
                        <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-faint flex items-center justify-center text-sm">👤</span>
                            بيانات المواطن
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">الاسم بالكامل</span>
                                <span className="text-navy font-bold text-sm">{p.citizen_name}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">الرقم القومي</span>
                                <span className="text-navy font-bold text-sm font-mono tracking-wider">{p.national_id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">رقم الموبايل</span>
                                <span className="text-navy font-bold text-sm">{p.phone || "—"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">المركز</span>
                                <span className="text-navy font-bold text-sm">{p.city}</span>
                            </div>
                        </div>
                    </div>

                    {/* Request info */}
                    <div className="bg-white rounded-2xl border border-border shadow-blue-form p-6">
                        <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-faint flex items-center justify-center text-sm">📋</span>
                            تفاصيل الطلب
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">نوع الطلب</span>
                                <span className="text-navy font-bold text-sm">{p.problem_type}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">الوزارة المعنية</span>
                                <span className="text-navy font-bold text-sm">{p.ministry || "—"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">تاريخ الإدخال</span>
                                <span className="text-navy font-bold text-sm">{formatDate(p.created_at)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase">تاريخ الطلب الأصلي</span>
                                <span className="text-navy font-bold text-sm">
                                    {p.request_date ? new Date(p.request_date).toLocaleDateString("ar-EG") : "—"}
                                </span>
                            </div>
                        </div>

                        {p.notes && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <span className="text-xs text-text-secondary font-semibold tracking-wide uppercase block mb-2">ملاحظات</span>
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4 border border-border">
                                    {p.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl border border-border shadow-blue-form p-6">
                        <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-faint flex items-center justify-center text-sm">📎</span>
                            المرفقات
                        </h2>
                        {attachments.length === 0 ? (
                            <p className="text-text-muted text-sm">لا توجد مرفقات</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {attachments.map((a) => {
                                    const isImage = a.file_type?.startsWith("image/");
                                    const isPdf = a.file_type === "application/pdf";
                                    return (
                                        <a
                                            key={a.id}
                                            href={a.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-border rounded-xl hover:border-blue hover:bg-blue-faint transition-all group"
                                        >
                                            <span className="text-xl shrink-0">
                                                {isImage ? "🖼️" : isPdf ? "📄" : "📝"}
                                            </span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-navy font-semibold text-sm truncate group-hover:text-blue transition-colors">
                                                    {a.file_url.split("/").pop()}
                                                </span>
                                                <span className="text-text-secondary text-xs">{formatDate(a.uploaded_at)}</span>
                                            </div>
                                            <svg className="w-4 h-4 text-text-secondary mr-auto shrink-0 group-hover:text-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — status panel */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-border shadow-blue-form p-6">
                        <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-faint flex items-center justify-center text-sm">⚙️</span>
                            تحديث الحالة
                        </h2>
                        <select
                            defaultValue={statuses.find((s) => s.name === p.status_name)?.id || ""}
                            onChange={(e) => updateStatus(e.target.value)}
                            disabled={statusUpdating}
                            className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-gray-50 text-right cursor-pointer text-sm disabled:opacity-60"
                        >
                            <option value="" disabled>اختر الحالة</option>
                            {statuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {statusArabic[s.name] || s.name}
                                </option>
                            ))}
                        </select>
                        {statusUpdating && (
                            <p className="text-blue text-xs mt-2 animate-pulse">جارٍ التحديث...</p>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="bg-white rounded-2xl border border-border shadow-blue-form p-6">
                        <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-faint flex items-center justify-center text-sm">🗂️</span>
                            معلومات السجل
                        </h2>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                <span className="text-text-secondary font-medium">رقم السجل</span>
                                <span className="text-navy font-bold">#{p.id}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                <span className="text-text-secondary font-medium">تاريخ الإدخال</span>
                                <span className="text-navy font-bold">{formatDate(p.created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary font-medium">المسؤول</span>
                                <span className="text-navy font-bold">{p.assigned_username || "غير محدد"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}