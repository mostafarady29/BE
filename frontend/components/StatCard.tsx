"use client";

import { useState } from "react";
import { C } from "@/constants/colors";

interface StatCardProps {
  num: string;
  label: string;
}

// momken neshilo 5ales | nestakhdemo f hero bas
export const StatCard = ({ num, label }: StatCardProps) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.blueFaint : C.white,
        border: `1px solid ${hov ? C.border : C.borderLight}`,
        borderRadius: 8,
        padding: "1.75rem",
        transition: "all 0.25s",
        boxShadow: hov
          ? `0 4px 20px rgba(30,111,168,0.1)`
          : `0 1px 4px rgba(30,111,168,0.04)`,
        position: "relative",
        overflow: "hidden",
        borderTop: `2px solid ${hov ? C.blue : "transparent"}`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-amiri)",
          fontSize: "2.8rem",
          fontWeight: 700,
          color: C.blue,
          lineHeight: 1,
          marginBottom: "0.4rem",
        }}
      >
        {num}
      </div>
      <div style={{ fontSize: "0.82rem", color: C.textMuted, lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  );
};
