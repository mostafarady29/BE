"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatDate } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("moderator");
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth.isAdmin()) {
            router.push("/dashboard");
            return;
        }
        setCurrentUser(auth.getUser());
        loadUsers();
    }, [router]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (err: any) {
            alert(err.message || "فشل تحميل المستخدمين");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user: any = null) => {
        setModalError(null);
        setEditId(user?.id || null);
        setUsername(user?.username || "");
        setPassword("");
        setPhone(user?.phone || "");
        setRole(user?.role || "moderator");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const saveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError(null);

        const payload: any = { username, phone, role };
        if (password) payload.password = password;

        try {
            if (editId) {
                await api.patch(`/users/${editId}`, payload);
            } else {
                await api.post("/users", { ...payload, password });
            }
            closeModal();
            loadUsers();
        } catch (err: any) {
            setModalError(err.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setModalLoading(false);
        }
    };

    const toggleStatus = async (user: any) => {
        const action = user.is_active ? "إيقاف" : "تفعيل";
        if (!confirm(`هل تريد ${action} حساب "${user.username}"؟`)) return;

        try {
            if (user.is_active) {
                await api.delete(`/users/${user.id}`);
            } else {
                await api.patch(`/users/${user.id}`, { is_active: true });
            }
            loadUsers();
        } catch (err: any) {
            alert(err.message || "حدث خطأ");
        }
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto min-h-screen" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-amiri text-navy mb-1">إدارة الموظفين</h1>
                    <p className="text-text-secondary">إضافة، تعديل وإيقاف حسابات الموظفين</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue hover:bg-blue-light text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-blue-sm hover:shadow-blue-md flex items-center gap-2"
                >
                    <span>+</span>
                    إضافة موظف
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-text-secondary border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold">اسم المستخدم</th>
                                <th className="px-6 py-4 font-semibold">الدور</th>
                                <th className="px-6 py-4 font-semibold">رقم الهاتف</th>
                                <th className="px-6 py-4 font-semibold">الحالة</th>
                                <th className="px-6 py-4 font-semibold">تاريخ الإنشاء</th>
                                <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-blue font-bold animate-pulse">
                                        جارٍ التحميل...
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-navy">#{u.id}</td>
                                        <td className="px-6 py-4 font-bold text-navy">{u.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                                                {u.role === "admin" ? "مدير" : "موظف"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary" style={{ direction: "ltr", textAlign: "right" }}>{u.phone || "—"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {u.is_active ? "نشط" : "موقوف"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{formatDate(u.created_at)}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(u)}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-navy rounded-md font-semibold text-xs transition-colors"
                                                >
                                                    تعديل
                                                </button>
                                                {currentUser?.id !== u.id && (
                                                    <button
                                                        onClick={() => toggleStatus(u)}
                                                        className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${u.is_active
                                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                                            }`}
                                                    >
                                                        {u.is_active ? "إيقاف" : "تفعيل"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                                        <div className="text-4xl mb-3">👥</div>
                                        لا يوجد موظفون حتى الآن
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-navy text-lg">{editId ? `تعديل: ${username}` : "إضافة موظف جديد"}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors text-xl">
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {modalError && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                                    <span>⚠️</span> {modalError}
                                </div>
                            )}

                            <form onSubmit={saveUser} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">اسم المستخدم *</label>
                                    <input
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">كلمة المرور {editId ? "" : "*"}</label>
                                    <input
                                        type="password"
                                        required={!editId}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={editId ? "اتركها فارغة إذا لا تريد التغيير" : "8 أحرف على الأقل"}
                                        className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue font-sans"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">رقم الهاتف</label>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">الدور *</label>
                                    <select
                                        required
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                                    >
                                        <option value="moderator">موظف (Moderator)</option>
                                        <option value="admin">مدير (Admin)</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-navy rounded-xl font-bold transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className="flex-1 py-2.5 bg-blue hover:bg-blue-light text-white rounded-xl font-bold transition-colors shadow-blue-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {modalLoading ? "جارٍ الحفظ..." : "حفظ الموظف"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
