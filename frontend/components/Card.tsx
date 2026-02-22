"use client";

import { useState } from "react";

interface CardProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const Card = ({ children, dark = false }: CardProps) => {
  const [hov, setHov] = useState(false);

  if (dark) {
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={`relative overflow-hidden bg-white rounded-lg p-7 transition-all duration-300 border border-border-light ${
          hov
            ? "border-border shadow-card-hover border-t-2 border-t-blue"
            : "shadow-[0_1px_6px_rgba(30,111,168,0.05)]"
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="group relative overflow-hidden bg-white rounded-lg p-7 transition-all duration-300 border border-border-light hover:-translate-y-1 hover:border-border hover:shadow-blue-xl shadow-[0_1px_6px_rgba(30,111,168,0.05)]"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Right accent bar  */}
      <span className="card-bar" />
      {children}
    </div>
  );
};
