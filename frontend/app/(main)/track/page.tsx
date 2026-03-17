"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { api } from "@/lib/api";

// Map status to styling classes and Arabic labels
const statusArabic: Record<string, string> = {
  Pending: "قيد الانتظار",
  "In Progress": "قيد التنفيذ",
  Resolved: "تم الحل",
  Rejected: "مرفوض",
};

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Resolved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };
  const cls = map[status] || "bg-gray-100 text-gray-800";
  const label = statusArabic[status] || status;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>
      {label}
    </span>
  );
}


export default function TrackPage() {
  const [nid, setNid] = useState("");
  const [pid, setPid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any | null>(null);

  const handleTrack = async () => {
    if (!nid || !pid) {
      setError("يرجى إدخال الرقم القومي ورقم الطلب");
      return;
    }

    setLoading(true);
    setError(null);
    setPost(null);

    try {
      const json = await api.post("/posts/track", {
        national_id: nid,
        post_id: parseInt(pid),
      });

      if (!json.success) {
        throw new Error(json.message || "حدث خطأ. حاول مجدداً.");
      }

      setPost(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-linear-to-br from-blue-faint to-surface text-right"
        dir="rtl"
      >
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="text-3xl font-bold font-amiri mb-2 text-navy">
              تتبع طلبك
            </h1>
            <p className="text-text-secondary">
              أدخل الرقم القومي ورقم الطلب لمعرفة حالته الحالية
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-blue-form border border-border mb-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                الرقم القومي
              </label>
              <input
                type="text"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                maxLength={14}
                placeholder="الرقم القومي (14 رقم)"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue transition-colors text-right"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                رقم الطلب
              </label>
              <input
                type="number"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                placeholder="رقم الطلب"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue transition-colors text-right"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              onClick={handleTrack}
              disabled={loading}
              className="w-full bg-gradient-blue-crimson text-white py-3 rounded-lg font-bold shadow-blue-md hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "جارٍ البحث..." : "تتبع ←"}
            </button>
          </div>

          {post && (
            <div className="bg-white p-8 rounded-2xl shadow-blue-form border border-border animate-fade-in">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                <h3 className="font-bold text-lg font-amiri text-navy">
                  طلب رقم #{post.id}
                </h3>
                {getStatusBadge(post.status_name)}
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-text-secondary">نوع المشكلة</span>
                <span className="font-medium text-text-primary max-w-[60%] text-left">
                  {post.problem_type}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-text-secondary">المدينة</span>
                <span className="font-medium text-text-primary max-w-[60%] text-left">
                  {post.city}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-text-secondary">تاريخ التقديم</span>
                <span className="font-medium text-text-primary max-w-[60%] text-left">
                  {new Date(post.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex justify-between py-2 mb-4 text-sm">
                <span className="text-text-secondary">المسؤول</span>
                <span className="font-medium text-text-primary max-w-[60%] text-left">
                  {post.assigned_username || "لم يُحدد بعد"}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-2 text-sm text-navy">
                  وصف الطلب
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {post.problem_description}
                </p>
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/#request-form"
                  className="text-sm text-blue hover:underline font-semibold"
                >
                  تقديم طلب جديد
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
