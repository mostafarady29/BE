"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, formatDate, statusBadge } from "@/lib/api";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [post, setPost] = useState<any>(null);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newStatus, setNewStatus] = useState("");
    const [assignUser, setAssignUser] = useState("");
    const isAdmin = auth.isAdmin();

    const statusArabic: any = {
        "Pending": "قيد الانتظار",
        "In Progress": "قيد التنفيذ",
        "Resolved": "تم الحل",
        "Rejected": "مرفوض"
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [postRes, statusRes, usersRes] = await Promise.all([
                api.get(`/posts/${id}`),
                api.get("/statuses"),
                isAdmin ? api.get("/users") : Promise.resolve({ data: [] }),
            ]);

            const p = postRes.data;
            setPost(p);
            setStatuses(statusRes.data);
            if (isAdmin) setUsers(usersRes.data);

            setNewStatus(statusRes.data.find((s: any) => s.name === p.status_name)?.id || "");
            setAssignUser(p.assigned_user_id?.toString() || "");
        } catch (err: any) {
            setError(err.message || "فشل تحميل تفاصيل الطلب");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, isAdmin]);

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        try {
            await api.patch(`/posts/${id}/status`, { status_id: parseInt(newStatus) });
            alert("تم تحديث الحالة بنجاح ✓");
            loadData();
        } catch (err: any) {
            alert(err.message || "حدث خطأ أثناء تحديث الحالة");
        }
    };

    const handleAssign = async () => {
        try {
            await api.patch(`/posts/${id}/assign`, { assigned_to: assignUser ? parseInt(assignUser) : null });
            alert("تم تعيين المسؤول بنجاح ✓");
            loadData();
        } catch (err: any) {
            alert(err.message || "حدث خطأ أثناء التعيين");
        }
    };

    const handleDelete = async () => {
        if (!confirm("هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        try {
            await api.delete(`/posts/${id}`);
            alert("تم حذف الطلب بنجاح ✓");
            router.push("/dashboard/posts");
        } catch (err: any) {
            alert(err.message || "حدث خطأ أثناء محاولة الحذف");
        }
    };

    // ─── Export to Excel ──────────────────────────────────────────────────────
    const exportExcel = () => {
        if (!post) return;

        const rows = [
            { "الحقل": "رقم الطلب", "القيمة": `#${post.id}` },
            { "الحقل": "الاسم", "القيمة": `${post.first_name} ${post.last_name}` },
            { "الحقل": "الرقم القومي", "القيمة": post.national_id },
            { "الحقل": "رقم الهاتف", "القيمة": post.phone || "—" },
            { "الحقل": "نوع المشكلة", "القيمة": post.problem_type },
            { "الحقل": "المدينة", "القيمة": post.city },
            { "الحقل": "الحالة", "القيمة": statusArabic[post.status_name] || post.status_name },
            { "الحقل": "المسؤول", "القيمة": post.assigned_username || "—" },
            { "الحقل": "تاريخ التقديم", "القيمة": formatDate(post.created_at) },
            { "الحقل": "وصف المشكلة", "القيمة": post.problem_description },
        ];

        const ws = XLSX.utils.json_to_sheet(rows);
        // Set column widths
        ws["!cols"] = [{ wch: 20 }, { wch: 50 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تفاصيل الطلب");
        XLSX.writeFile(wb, `طلب-${post.id}.xlsx`);
    };

    // ─── Export to PDF (print) ────────────────────────────────────────────────
    const exportPDF = () => {
        if (!post) return;

        const statusLabel = statusArabic[post.status_name] || post.status_name;

        const statusColors: any = {
            "Pending": { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
            "In Progress": { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
            "Resolved": { bg: "#dcfce7", color: "#166534", border: "#86efac" },
            "Rejected": { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
        };
        const sc = statusColors[post.status_name] || { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };

        const attachmentsList = post.attachments && post.attachments.length > 0
            ? post.attachments.map((a: any) =>
                `<li style="padding:4px 0;color:#334155;">
                    ${a.file_type?.startsWith("image/") ? "🖼️" : "📄"}
                    ${a.file_type?.toUpperCase() || "FILE"} — ${formatDate(a.uploaded_at)}
                </li>`
            ).join("")
            : `<li style="color:#94a3b8;">لا توجد مرفقات</li>`;

        const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8"/>
    <title>طلب #${post.id}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            padding: 40px;
            color: #1e293b;
            background: #fff;
            font-size: 13px;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .header-title { font-size: 26px; font-weight: 800; color: #1e3a8a; }
        .header-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 13px;
            background: ${sc.bg};
            color: ${sc.color};
            border: 1px solid ${sc.border};
        }

        /* Sections */
        .section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .section-header {
            background: #1e3a8a;
            color: white;
            padding: 10px 20px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.3px;
        }
        .section-body { padding: 16px 20px; }

        /* Rows */
        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 9px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .row:last-child { border-bottom: none; }
        .row-label { color: #64748b; font-weight: 600; flex-shrink: 0; width: 140px; }
        .row-value { color: #0f172a; font-weight: 700; text-align: left; flex: 1; }

        /* Description box */
        .description-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            margin-top: 12px;
            line-height: 1.8;
            color: #1e293b;
        }

        /* Attachments */
        .attachments-list { list-style: none; padding: 0; }
        .attachments-list li { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
        .attachments-list li:last-child { border-bottom: none; }

        /* Footer */
        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            color: #94a3b8;
            font-size: 11px;
        }

        @media print {
            body { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="header-title">طلب #${post.id}</div>
            <div class="header-sub">تاريخ التقديم: ${formatDate(post.created_at)}</div>
        </div>
        <div>
            <span class="status-badge">${statusLabel}</span>
        </div>
    </div>

    <!-- Citizen Info -->
    <div class="section">
        <div class="section-header">👤 بيانات المواطن</div>
        <div class="section-body">
            <div class="row">
                <span class="row-label">الاسم الكامل</span>
                <span class="row-value">${post.first_name} ${post.last_name}</span>
            </div>
            <div class="row">
                <span class="row-label">الرقم القومي</span>
                <span class="row-value" style="font-family:monospace;letter-spacing:2px;font-size:12px;">${post.national_id}</span>
            </div>
            <div class="row">
                <span class="row-label">رقم الهاتف</span>
                <span class="row-value">${post.phone || "—"}</span>
            </div>
        </div>
    </div>

    <!-- Request Info -->
    <div class="section">
        <div class="section-header">📋 تفاصيل الطلب</div>
        <div class="section-body">
            <div class="row">
                <span class="row-label">نوع المشكلة</span>
                <span class="row-value">${post.problem_type}</span>
            </div>
            <div class="row">
                <span class="row-label">المدينة</span>
                <span class="row-value">${post.city}</span>
            </div>
            <div class="row">
                <span class="row-label">المسؤول</span>
                <span class="row-value">${post.assigned_username || "—"}</span>
            </div>
            <div style="margin-top:12px;">
                <div style="font-weight:700;color:#64748b;font-size:12px;margin-bottom:6px;">وصف المشكلة:</div>
                <div class="description-box">${post.problem_description}</div>
            </div>
        </div>
    </div>

    <!-- Attachments -->
    <div class="section">
        <div class="section-header">📎 المرفقات (${post.attachments?.length || 0})</div>
        <div class="section-body">
            <ul class="attachments-list">${attachmentsList}</ul>
        </div>
    </div>

    <div class="footer">
        <span>تم إنشاء هذا المستند تلقائياً</span>
        <span>طلب #${post.id} — ${formatDate(post.created_at)}</span>
    </div>
</body>
</html>`;

        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); };
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-xl animate-pulse text-blue font-bold">جارٍ تحميل بيانات الطلب...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="p-8 max-w-300 mx-auto min-h-screen">
                <Link href="/dashboard/posts" className="inline-block mb-6 px-4 py-2 bg-white rounded-lg shadow-sm border border-border text-text-secondary hover:text-blue transition-colors">
                    ← عودة للطلبات
                </Link>
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span> {error || "الطلب غير موجود"}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-350 mx-auto min-h-screen" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/posts" className="px-4 py-2 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-border text-sm font-semibold text-text-secondary hover:text-blue hover:border-blue transition-colors">
                        ← رجوع
                    </Link>
                    <h1 className="text-3xl font-bold font-amiri text-navy">طلب #{post.id}</h1>
                    <div dangerouslySetInnerHTML={{ __html: statusBadge(post.status_name, statusArabic[post.status_name] || post.status_name) }} className="text-sm shadow-sm" />
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={exportExcel}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200"
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all duration-200"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Citizen Info */}
                    <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-border">
                            <h3 className="font-bold text-navy text-lg">بيانات المواطن</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                                <span className="text-text-secondary">الاسم</span>
                                <span className="font-bold text-navy">{post.first_name} {post.last_name}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                                <span className="text-text-secondary">الرقم القومي</span>
                                <span className="font-mono text-sm tracking-widest text-navy">{post.national_id}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                                <span className="text-text-secondary">رقم الهاتف</span>
                                <span className="font-bold text-navy">{post.phone || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Request Info */}
                    <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-border">
                            <h3 className="font-bold text-navy text-lg">تفاصيل الطلب</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-text-secondary">نوع المشكلة</span>
                                <span className="font-bold text-navy">{post.problem_type}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-text-secondary">المدينة</span>
                                <span className="font-bold text-navy">{post.city}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-text-secondary">تاريخ التقديم</span>
                                <span className="font-bold text-navy">{formatDate(post.created_at)}</span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                <h4 className="font-semibold text-text-secondary mb-3 text-sm">وصف المشكلة:</h4>
                                <p className="text-navy leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {post.problem_description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold text-navy text-lg">المرفقات</h3>
                            {post.attachments && post.attachments.length > 0 && (
                                <span className="bg-blue-faint text-blue px-3 py-1 rounded-full text-xs font-bold">
                                    {post.attachments.length} ملف
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            {post.attachments && post.attachments.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {post.attachments.map((a: any) => {
                                        const isImage = a.file_type && a.file_type.startsWith("image/");
                                        return (
                                            <Link
                                                key={a.id}
                                                href={a.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue hover:bg-blue-faint transition-colors group cursor-pointer"
                                            >
                                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                                    {isImage ? "🖼️" : "📄"}
                                                </span>
                                                <div className="text-xs font-bold text-text-secondary group-hover:text-blue mb-1">
                                                    {a.file_type?.split("/")[1]?.toUpperCase() || "FILE"}
                                                </div>
                                                <div className="text-[0.65rem] text-text-muted">
                                                    {formatDate(a.uploaded_at)}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-text-muted text-sm text-center py-4">لا توجد مرفقات مع هذا الطلب</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Update Status */}
                    <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-border">
                            <h3 className="font-bold text-navy text-base">تحديث الحالة</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-text-secondary">اختر الحالة الجديدة</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right"
                                >
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.id}>{statusArabic[s.name] || s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleUpdateStatus}
                                className="w-full bg-blue text-white py-2.5 rounded-lg font-bold shadow-blue-sm hover:shadow-blue-md hover:-translate-y-0.5 transition-all text-sm"
                            >
                                حفظ الحالة
                            </button>
                        </div>
                    </div>

                    {/* Assign User (Admin only) */}
                    {isAdmin && (
                        <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-border">
                                <h3 className="font-bold text-navy text-base">تعيين مسؤول</h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2 text-text-secondary">الموظف المسؤول</label>
                                    <select
                                        value={assignUser}
                                        onChange={(e) => setAssignUser(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-blue bg-white text-right"
                                    >
                                        <option value="">بدون تعيين</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAssign}
                                    className="w-full bg-white text-navy border border-border py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-colors text-sm"
                                >
                                    حفظ التعيين
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Delete (Admin only) */}
                    {isAdmin && (
                        <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
                            <div className="p-6 text-center">
                                <h3 className="font-bold text-red-800 text-sm mb-3">منطقة الخطر</h3>
                                <button
                                    onClick={handleDelete}
                                    className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.2)] text-sm flex items-center justify-center gap-2"
                                >
                                    <span>🗑️</span>
                                    حذف هذا الطلب نهائياً
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}