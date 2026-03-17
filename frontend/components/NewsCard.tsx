"use client";

import Image from "next/image";
import { Card } from "./Card";

interface NewsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tag: string | null;
  title: string;
  desc: string;
  date: string;
  image_url?: string | null; // 👈 new prop
  onReadMore: () => void;
}

export const NewsCard = ({
  tag,
  title,
  desc,
  date,
  image_url,
  onReadMore,
  ...rest
}: NewsCardProps) => (
  <Card dark {...rest}>
    {/* Optional image */}
    {image_url && (
      <div className="mb-4 -mt-2 -mx-2 rounded-t-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          width={400}
          height={240}
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </div>
    )}

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
      <button
        onClick={onReadMore}
        className="text-blue text-[0.78rem] font-bold no-underline hover:underline cursor-pointer"
      >
        قراءة المزيد ←
      </button>
    </div>
  </Card>
);
