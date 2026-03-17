"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { NewsCard } from "@/components/NewsCard";
import { NewsModal } from "@/components/NewsModal";
import { api, formatDate } from "@/lib/api";
import { News } from "@/types/news";

export default function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await api.get("/news/public");
        setNews(res.data || []);
      } catch (err: any) {
        setNewsError(err.message || "فشل تحميل الأخبار");
      } finally {
        setLoadingNews(false);
      }
    }
    fetchNews();
  }, []);

  const openNewsModal = (item: News) => {
    setSelectedNews(item);
    setModalOpen(true);
  };

  const closeNewsModal = () => {
    setModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <>
      <Hero />

      <Section
        eyebrow="خدمات الدائرة"
        title="كيف يمكننا مساعدتك؟"
        id="services"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ServiceCard
            icon="🏛️"
            title="خدمة المواطنين"
            desc="تقديم الدعم والمشورة للمواطنين في مختلف القضايا، والتواصل مع الجهات الحكومية لحل مشكلاتهم."
          />
          <ServiceCard
            icon="🏗️"
            title="التنمية المحلية"
            desc="مشاريع تطوير البنية التحتية والمرافق العامة لتحسين جودة الحياة في دسوق وفوه ومطوبس."
          />
          <ServiceCard
            icon="🎓"
            title="المبادرات الشبابية"
            desc="دعم الشباب وتوفير فرص التدريب والتوظيف وريادة الأعمال لبناء جيل قادر على المستقبل."
          />
        </div>
      </Section>

      <Section eyebrow="أحدث الأخبار" title="آخر المستجدات" dark id="news">
        {loadingNews ? (
          <div className="text-center p-10 text-blue animate-pulse font-bold">
            جارٍ تحميل الأخبار...
          </div>
        ) : newsError ? (
          <div className="text-center p-10 text-red-600 font-bold">
            ⚠️ {newsError}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center p-10 text-text-muted font-bold">
            📭 لا توجد أخبار حتى الآن
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                tag={item.tag}
                title={item.title}
                desc={
                  item.content.length > 120
                    ? item.content.slice(0, 120) + "..."
                    : item.content
                }
                date={formatDate(item.created_at)}
                image_url={item.image_url}
                onReadMore={() => openNewsModal(item)}
              />
            ))}
          </div>
        )}
      </Section>

      <NewsModal
        isOpen={modalOpen}
        onClose={closeNewsModal}
        news={selectedNews}
      />
    </>
  );
}
