"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const requestTypes = ["شكوى", "طلب مساعدة أو دعم", "اقتراح", "أخرى"];

const cities = ["دسوق", "فوة", "مطوبس"];

const ministries = [
  "رئاسة مجلس الوزراء",
  "وزارة الدفاع والإنتاج الحربى",
  "وزارة الإنتاج الحربى",
  "وزارة البترول والثروة المعدنية",
  "وزارة الكهرباء والطاقة المتجددة",
  "وزارة الخارجية",
  "وزارة البيئة",
  "وزارة الإتصالات وتكنولوجيا المعلومات",
  "وزارة التربية والتعليم",
  "وزارة القوى العاملة",
  "وزارة العدل",
  "وزارة التنمية المحلية",
  "وزارة الإسكان والمرافق والمجتمعات العمرانية",
  "وزارة الأوقاف",
  "وزارة الداخلية",
  "وزارة التجارة والصناعة",
  "وزارة المالية",
  "وزارة الطيران المدنى",
  "وزارة النقل",
  "وزارة الثقافة",
  "وزارة الصحة والسكان",
  "وزارة الموارد المائية والرى",
  "وزارة الزراعة",
  "وزارة التعاون الدولى",
  "وزارة التخطيط والتنمية الإقتصادية",
  "وزارة التعليم العالى والبحث العلمى",
  "وزارة التموين والتجارة الداخلية",
  "وزارة السياحة والآثار",
  "وزارة الشباب والرياضة",
  "وزارة شئون المجالس النيابية",
  "وزارة التضامن الإجتماعى",
  "وزارة الدولة للهجرة وشئون المصريين بالخارج",
  "وزارة قطاع الأعمال العام",
];

const formSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون أكثر من 3 أحرف"),
  nationalId: z
    .string()
    .length(14, "الرقم القومي يجب أن يكون 14 رقمًا")
    .regex(/^\d+$/, "الرقم القومي يجب أن يحتوي على أرقام فقط"),
  mobile: z
    .string()
    .regex(/^01[0-9]{9}$/, "رقم الموبايل غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقمًا)"),
  city: z.string().min(1, "يرجى اختيار المركز"),
  ministry: z.string().min(1, "يرجى اختيار الوزارة"),
  requestType: z.string().min(1, "يرجى اختيار نوع الطلب"),
  description: z.string().min(10, "وصف المشكلة يجب أن يكون أكثر من 10 أحرف"),
});


type FormData = z.infer<typeof formSchema>;

const ICONS: Record<string, string> = {
  fullName: "👤",
  nationalId: "🪪",
  mobile: "📱",
  city: "📍",
  ministry: "🏛️",
  requestType: "📋",
  description: "✍️",
  file: "📎",
};

/* ── Field Wrapper ── */
interface FieldWrapperProps {
  label: string;
  icon: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

const FieldWrapper = ({
  label,
  icon,
  error,
  children,
  hint,
}: FieldWrapperProps) => (
  <div className="flex flex-col gap-[0.4rem]">
    <label
      className={`flex items-center gap-[0.4rem] font-semibold text-[0.88rem] tracking-[0.01em] mb-[0.1rem] ${error ? "text-red-700" : "text-gray-700"}`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[0.85rem] shrink-0 transition-colors duration-200 ${error ? "bg-red-100" : "bg-blue-faint"}`}
      >
        {icon}
      </span>
      {label}
    </label>
    {children}
    {error && (
      <p className="text-red-700 text-[0.78rem] m-0 flex items-center gap-[0.3rem] pr-[0.2rem]">
        <span className="text-[0.7rem]">⚠️</span>
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-gray-400 text-[0.76rem] m-0 pr-[0.2rem]">{hint}</p>
    )}
  </div>
);

/* ── Shared input className builder ── */
const inputCls = (hasError: boolean) =>
  `form-input w-full px-4 py-3 border-[1.5px] rounded-[10px] text-[0.95rem] font-[inherit] text-gray-900 outline-none transition-all duration-200 box-border text-right direction-rtl ${hasError ? "border-red-300 bg-red-50 error" : "border-gray-200 bg-gray-50"
  }`;

/* ── Main Component ── */
export const RequestForm = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      nationalId: "",
      mobile: "",
      city: "",
      ministry: "",
      requestType: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    setLoading(true);
    try {
      // Split fullName → first_name + last_name
      const nameParts = data.fullName.trim().split(/\s+/);
      const first_name = nameParts[0] ?? data.fullName;
      const last_name = nameParts.slice(1).join(" ") || first_name;

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: data.nationalId,
          first_name,
          last_name,
          phone: data.mobile,
          city: data.city,
          ministry: data.ministry,
          problem_type: data.requestType,
          problem_description: data.description,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg =
          json?.errors?.[0]?.msg ||
          json?.message ||
          "حدث خطأ أثناء إرسال الطلب";
        throw new Error(msg);
      }

      setPostId(json.data.post_id);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setPostId(null);
        reset();
        setFiles(null);
      }, 6000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ، حاول مجدداً";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="bg-white rounded-[20px] p-16 shadow-blue-form border border-gray-200 text-center animate-fade-in">
        <div className="w-18 h-18 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[2rem] mx-auto mb-6 shadow-success">
          ✓
        </div>
        <h3 className="font-amiri text-[1.8rem] text-gray-900 m-0 mb-3">
          تم إرسال طلبك بنجاح
        </h3>
        {postId && (
          <p className="text-blue-600 font-bold text-[1.1rem] mb-2">
            رقم طلبك: <span className="text-[1.4rem]">#{postId}</span>
          </p>
        )}
        <p className="text-gray-500 text-[0.95rem] m-0">
          احتفظ برقم الطلب — يمكنك تتبع حالته لاحقاً
        </p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div
      className="bg-white rounded-[20px] shadow-blue-form border border-gray-200 overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="relative bg-gradient-blue-crimson px-6 md:px-10 py-6 md:py-8 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -left-8 w-30 h-30 rounded-full bg-white/6" />
        <div className="absolute -bottom-5 right-[30%] w-20 h-20 rounded-full bg-white/5" />

        <div className="relative z-1">
          <p className="text-white/70 text-[0.75rem] font-semibold tracking-[0.15em] uppercase m-0 mb-[0.4rem]">
            دائرة دسوق - فوة - مطوبس
          </p>
          <h3 className="font-amiri text-white text-form-title font-bold m-0 mb-2">
            تقديم طلب خدمة
          </h3>
          <p className="text-white/75 text-[0.9rem] m-0">
            يرجى ملء البيانات التالية وسيتم التواصل معكم في أقرب وقت
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-10">
        {/* API error banner */}
        {apiError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[0.9rem] flex items-center gap-2">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWrapper
                label="الاسم بالكامل"
                icon={ICONS.fullName}
                error={errors.fullName?.message}
              >
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="مثال: أحمد محمد علي"
                  className={inputCls(!!errors.fullName)}
                />
              </FieldWrapper>

              <FieldWrapper
                label="الرقم القومي"
                icon={ICONS.nationalId}
                error={errors.nationalId?.message}
                hint="14 رقمًا بدون مسافات"
              >
                <input
                  type="text"
                  {...register("nationalId")}
                  placeholder="30012345678901"
                  maxLength={14}
                  className={inputCls(!!errors.nationalId)}
                />
              </FieldWrapper>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWrapper
                label="رقم الموبايل"
                icon={ICONS.mobile}
                error={errors.mobile?.message}
                hint="يبدأ بـ 01 ويتكون من 11 رقمًا"
              >
                <input
                  type="tel"
                  {...register("mobile")}
                  placeholder="01xxxxxxxxx"
                  className={inputCls(!!errors.mobile)}
                />
              </FieldWrapper>


              <FieldWrapper
                label="نوع الطلب"
                icon={ICONS.requestType}
                error={errors.requestType?.message}
              >
                <select
                  {...register("requestType")}
                  className={`${inputCls(!!errors.requestType)} cursor-pointer appearance-none pl-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 1rem center",
                  }}
                >
                  <option value="" disabled>
                    اختر نوع الطلب
                  </option>
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldWrapper>
            </div>

            {/* Row 3 — City & Ministry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldWrapper
                label="المركز"
                icon={ICONS.city}
                error={errors.city?.message}
              >
                <select
                  {...register("city")}
                  className={`${inputCls(!!errors.city)} cursor-pointer appearance-none pl-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 1rem center",
                  }}
                >
                  <option value="" disabled>اختر المركز</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FieldWrapper>

              <FieldWrapper
                label="الوزارة المعنية"
                icon={ICONS.ministry}
                error={errors.ministry?.message}
              >
                <select
                  {...register("ministry")}
                  className={`${inputCls(!!errors.ministry)} cursor-pointer appearance-none pl-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 1rem center",
                  }}
                >
                  <option value="" disabled>اختر الوزارة</option>
                  {ministries.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FieldWrapper>
            </div>

            {/* Description */}
            <FieldWrapper
              label="وصف المشكلة أو الطلب"
              icon={ICONS.description}
              error={errors.description?.message}
            >
              <textarea
                {...register("description")}
                rows={5}
                placeholder="اكتب هنا تفاصيل طلبك أو مشكلتك بشكل واضح..."
                className={`${inputCls(!!errors.description)} resize-y min-h-32.5 leading-[1.7]`}
              />
            </FieldWrapper>

            {/* File upload */}
            <FieldWrapper label="مرفقات (اختياري)" icon={ICONS.file}>
              <label className="file-zone flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 transition-all duration-200">
                <span className="text-[1.8rem]">📁</span>
                <span className="text-[0.9rem] text-gray-500 font-medium">
                  {files && files.length > 0
                    ? `${files.length} ملف${files.length > 1 ? "ات" : ""} محدد${files.length > 1 ? "ة" : ""}`
                    : "اضغط لاختيار ملفات أو اسحبها هنا"}
                </span>
                <span className="text-[0.75rem] text-gray-400">
                  jpg, png, pdf — حتى 10 ميجابايت
                </span>
                <input
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />
              </label>
            </FieldWrapper>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn w-full py-4 bg-gradient-blue-crimson text-white border-0 rounded-xl text-[1.05rem] font-bold font-[inherit] cursor-pointer tracking-[0.03em] shadow-[0_6px_20px_rgba(30,111,168,0.35)] transition-all duration-250 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-[1rem]">⏳</span>
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الطلب</span>
                  <span className="text-[1.1rem]">←</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
