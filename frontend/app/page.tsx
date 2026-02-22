"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { NewsCard } from "@/components/NewsCard";
import { Footer } from "@/components/Footer";
import { RequestForm } from "@/components/RequestForm";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      {/* Services */}
      <Section eyebrow="خدمات الدائرة" title="كيف يمكننا مساعدتك؟" id="services">
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

      {/* News */}
      <Section eyebrow="أحدث الأخبار" title="آخر المستجدات" dark id="news">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <NewsCard
            tag="التنمية المحلية"
            title="افتتاح مشروع تطوير شارع الجيش بدسوق"
            desc="تم الانتهاء من المرحلة الأولى لتطوير شارع الجيش بمدينة دسوق، شاملاً رصف الطرق وتحديث شبكة الإضاءة العامة."
            date="منذ يومين"
          />
          <NewsCard
            tag="الشباب والتوظيف"
            title="لقاء مع شباب فوه لمناقشة فرص العمل"
            desc="عقد النائب اجتماعاً مثمراً مع شباب مركز فوه للاستماع إلى مقترحاتهم وبحث سبل توفير فرص عمل جديدة."
            date="منذ ٥ أيام"
          />
        </div>
      </Section>

      <Section title="تقديم طلب خدمة" id="request-form">
        <RequestForm />
      </Section>

      <Footer />
    </>
  );
}
