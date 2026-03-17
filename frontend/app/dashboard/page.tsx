"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatDate, statusBadge } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusArabic: any = {
    "Pending": "قيد الانتظار",
    "In Progress": "قيد التنفيذ",
    "Resolved": "تم الحل",
    "Rejected": "مرفوض"
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/recent"),
        ]);
        setData({ stats: statsRes.data, recent: recentRes.data });
      } catch (err: any) {
        setError(err.message || "فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-xl animate-pulse text-blue font-bold">
          جارٍ تحميل لوحة التحكم...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <span className="text-2xl">⚠️</span> {error}
        </div>
      </div>
    );
  }

  const { totals, by_status, top_cities, top_types } = data.stats;
  const recent = data.recent;

  const pendingCount =
    by_status.find((s: any) => s.status === "Pending")?.count || 0;
  const inProgressCount =
    by_status.find((s: any) => s.status === "In Progress")?.count || 0;
  const resolvedCount =
    by_status.find((s: any) => s.status === "Resolved")?.count || 0;

  const maxCity = Math.max(...top_cities.map((c: any) => c.count), 1);
  const maxType = Math.max(...top_types.map((t: any) => t.count), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-navy mb-1">
            لوحة التحكم
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">نظرة عامة على طلبات المواطنين</p>
        </div>
        <Link
          href="/dashboard/posts"
          className="bg-blue hover:bg-blue-light text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold transition-all shadow-blue-sm hover:shadow-blue-md text-sm sm:text-base"
        >
          عرض جميع الطلبات
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {[
          { label: "إجمالي الطلبات", value: totals.total_posts, icon: "📋" },
          { label: "قيد الانتظار", value: pendingCount, icon: "⏳" },
          { label: "قيد التنفيذ", value: inProgressCount, icon: "⚙️" },
          { label: "تم الحل", value: resolvedCount, icon: "✅" },
          { label: "هذا الأسبوع", value: totals.posts_this_week, icon: "📅" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-blue-form border border-border flex flex-col relative overflow-hidden group"
          >
            <div className="text-text-secondary font-semibold text-xs sm:text-sm mb-2 relative z-10 leading-tight">
              {stat.label}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-navy relative z-10">
              {stat.value}
            </div>
            <div className="absolute left-3 bottom-3 text-3xl sm:text-4xl opacity-10 group-hover:scale-110 transition-transform duration-300">
              {stat.icon}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue to-crimson transform scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Cities */}
        <div className="bg-white rounded-2xl shadow-blue-form border border-border p-4 sm:p-6">
          <h3 className="font-bold text-navy mb-4 sm:mb-6 text-base sm:text-lg">أكثر المدن</h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            {top_cities.length > 0 ? (
              top_cities.slice(0, 8).map((c: any) => (
                <div key={c.city} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="w-20 sm:w-24 text-text-secondary truncate text-right">
                    {c.city}
                  </div>
                  <div className="flex-1 h-2 bg-blue-faint rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue rounded-full"
                      style={{ width: `${(c.count / maxCity) * 100}%` }}
                    />
                  </div>
                  <div className="w-6 sm:w-8 text-left text-navy font-bold">
                    {c.count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Types */}
        <div className="bg-white rounded-2xl shadow-blue-form border border-border p-4 sm:p-6">
          <h3 className="font-bold text-navy mb-4 sm:mb-6 text-base sm:text-lg">أنواع المشاكل</h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            {top_types.length > 0 ? (
              top_types.slice(0, 8).map((t: any) => (
                <div key={t.problem_type} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="w-20 sm:w-24 text-text-secondary truncate text-right">
                    {t.problem_type.split(" ")[0]}
                  </div>
                  <div className="flex-1 h-2 bg-blue-faint rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${(t.count / maxType) * 100}%` }}
                    />
                  </div>
                  <div className="w-6 sm:w-8 text-left text-navy font-bold">
                    {t.count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-navy text-base sm:text-lg">أحدث الطلبات</h3>
          <Link
            href="/dashboard/posts"
            className="text-xs sm:text-sm font-semibold text-blue hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm min-w-[500px]">
            <thead className="bg-gray-50 text-text-secondary border-b border-border">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">#</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">المواطن</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold hidden sm:table-cell">نوع المشكلة</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold hidden md:table-cell">المدينة</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">الحالة</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold hidden sm:table-cell">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0 ? (
                recent.map((p: any) => (
                  <tr
                    key={p.id}
                    onClick={() => (window.location.href = `/dashboard/posts/${p.id}`)}
                    className="border-b border-gray-100 hover:bg-blue-faint cursor-pointer transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-navy">#{p.id}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-navy">{p.citizen_name}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-text-secondary hidden sm:table-cell">{p.problem_type}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-text-secondary hidden md:table-cell">{p.city}</td>
                    <td
                      className="px-3 sm:px-6 py-3 sm:py-4"
                      dangerouslySetInnerHTML={{
                        __html: statusBadge(p.status, statusArabic[p.status] || p.status),
                      }}
                    />
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-text-secondary hidden sm:table-cell">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <div className="text-3xl mb-2">📭</div>
                    لا توجد طلبات حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}