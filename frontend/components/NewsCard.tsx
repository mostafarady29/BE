"use client";

import Link from "next/link";
import { Card } from "./Card";

interface NewsCardProps {
  tag: string;
  title: string;
  desc: string;
  date: string;
}

export const NewsCard = ({ tag, title, desc, date }: NewsCardProps) => (
  <Card dark>
    {/* Tag */}
    <div className="flex items-center gap-2 text-blue text-[0.68rem] font-bold tracking-[0.12em] uppercase mb-[0.9rem]">
      <span className="block w-5 h-px bg-blue" />
      {tag}
    </div>

    <h4 className="font-amiri text-[1.15rem] font-bold text-text-primary leading-[1.45] mb-3">
      {title}
    </h4>

    <p className="text-text-secondary text-[0.86rem] leading-[1.85] mb-5">
      {desc}
    </p>

    <div className="flex justify-between items-center pt-4 border-t border-border-light">
      <span className="text-text-muted text-[0.78rem]">{date}</span>
      <Link
        href="/#news"
        className="text-blue text-[0.78rem] font-bold no-underline"
      >
        قراءة المزيد ←
      </Link>
    </div>
  </Card>
);
