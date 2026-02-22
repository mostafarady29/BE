"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, formatDate, statusBadge } from "@/lib/api";
import { auth } from "@/lib/auth";

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

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-xl animate-pulse text-blue font-bold">جارٍ تحميل بيانات الطلب...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
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
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/posts" className="px-4 py-2 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-border text-sm font-semibold text-text-secondary hover:text-blue hover:border-blue transition-colors">
                        ← رجوع
                    </Link>
                    <h1 className="text-3xl font-bold font-amiri text-navy">طلب #{post.id}</h1>
                    <div dangerouslySetInnerHTML={{ __html: statusBadge(post.status_name) }} className="text-sm shadow-sm" />
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
                                            <a
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
                                            </a>
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
                                        <option key={s.id} value={s.id}>{s.name}</option>
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

                    {/* Assign User (Admin only technically) */}
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
                                    className="w-full bg-white text-navy border border-border py-2.5 rounded-lg font-bold hover:bg-gray-50  transition-colors text-sm"
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
