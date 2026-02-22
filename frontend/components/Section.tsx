import { GEO_SVG } from "@/constants/colors";

interface SectionProps {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}

export const Section = ({
  eyebrow,
  title,
  children,
  dark = false,
  id,
}: SectionProps) => (
  <section
    id={id}
    className={`relative py-22 ${dark ? "bg-surface" : "bg-white"}`}
  >
    {/* Geo overlay for dark sections */}
    {dark && (
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: GEO_SVG, backgroundSize: "56px 56px" }}
      />
    )}

    {/* Top separator */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-section-top" />

    <div className="relative z-1 max-w-container mx-auto px-8">
      {(eyebrow || title) && (
        <div className="text-center mb-14">
          {eyebrow && (
            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-blue mb-[0.6rem]">
              {eyebrow}
            </p>
          )}
          {title && (
            <div className="inline-block relative">
              <h2 className="font-amiri text-section font-bold text-text-primary">
                {title}
              </h2>
              <div className="h-0.75 mt-2 rounded-sm bg-linear-to-r from-blue via-blue-light to-transparent" />
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  </section>
);
