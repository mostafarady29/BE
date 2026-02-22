"use client";

import { Card } from "./Card";

interface ServiceCardProps {
  icon: string;
  title: string;
  desc: string;
}

export const ServiceCard = ({ icon, title, desc }: ServiceCardProps) => (
  <Card>
    <div className="w-12.5 h-12.5 bg-blue-faint rounded-lg flex items-center justify-center text-[1.4rem] mb-5">
      {icon}
    </div>
    <h3 className="font-amiri text-[1.2rem] font-bold text-text-primary mb-3">
      {title}
    </h3>
    <p className="text-text-secondary text-[0.88rem] leading-[1.85]">{desc}</p>
  </Card>
);
