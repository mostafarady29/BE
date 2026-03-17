"use client";

import { useEffect, useState } from "react";
import { api, formatDate } from "@/lib/api";
import { News } from "@/types/news";

export default function NewsDashboardPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (err: any) {
      alert(err.message || "فشل تحميل الأخبار");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: News | null = null) => {
    setModalError(null);
    setEditId(item?.id || null);
    setTitle(item?.title || "");
    setContent(item?.content || "");
    setTag(item?.tag || "");
    setImageUrl(item?.image_url || "");
    setIsPublished(item?.is_published ?? false);
    setIsFeatured(item?.is_featured ?? false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const saveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tag: tag.trim() || null,
      image_url: imageUrl.trim() || null,
      is_published: isPublished,
      is_featured: isFeatured,
    };

    try {
      if (editId) {
        await api.put(`/news/${editId}`, payload);
      } else {
        await api.post("/news", payload);
      }
      closeModal();
      loadNews();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setModalLoading(false);
    }
  };

  const deleteNews = async (id: number) => {
    if (!confirm("هل تريد حذف الخبر؟")) return;
    try {
      await api.delete(`/news/${id}`);
      setNews(news.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-amiri text-navy mb-1">
            إدارة الأخبار
          </h1>
          <p className="text-text-secondary">إضافة، تعديل وحذف الأخبار</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue hover:bg-blue-light text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-blue-sm hover:shadow-blue-md flex items-center gap-2"
        >
          <span>+</span>
          إضافة خبر
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-blue-form border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-text-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">#</th>
                <th className="px-6 py-4 font-semibold">العنوان</th>
                <th className="px-6 py-4 font-semibold">الوسم</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
                <th className="px-6 py-4 font-semibold">مميز</th>
                <th className="px-6 py-4 font-semibold">التاريخ</th>
                <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-blue font-bold animate-pulse"
                  >
                    جارٍ التحميل...
                  </td>
                </tr>
              ) : news.length > 0 ? (
                news.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-navy">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-navy">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {item.tag || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${item.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {item.is_published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_featured ? (
                        <span className="text-lg" title="مميز">
                          ⭐
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-navy rounded-md font-semibold text-xs transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteNews(item.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-semibold text-xs transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-text-muted"
                  >
                    <div className="text-4xl mb-3">📰</div>
                    لا توجد أخبار حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-navy text-lg">
                {editId ? `تعديل: ${title}` : "إضافة خبر جديد"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {modalError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <span>⚠️</span> {modalError}
                </div>
              )}

              <form onSubmit={saveNews} className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    العنوان *
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                    placeholder="عنوان الخبر"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    المحتوى *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue resize-y"
                    placeholder="محتوى الخبر..."
                  />
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    الوسم (اختياري)
                  </label>
                  <input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                    placeholder="مثال: اجتماع, بيان, فعالية"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-blue"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue focus:ring-blue"
                    />
                    <span className="text-sm font-medium">منشور</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue focus:ring-blue"
                    />
                    <span className="text-sm font-medium">
                      مميز (يظهر في أعلى القائمة)
                    </span>
                  </label>
                </div>

                {/* Buttons */}
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
                    {modalLoading ? "جارٍ الحفظ..." : "حفظ الخبر"}
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
