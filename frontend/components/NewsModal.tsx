"use client";

import { useEffect, useState } from "react";
import { api, formatDate } from "@/lib/api";
import { News } from "@/types/news";

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: News | null;
}

export function NewsModal({ isOpen, onClose, news }: NewsModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold font-amiri text-navy">{news?.title || "تفاصيل الخبر"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {news && (
            <>
              {news.image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden">
                  <img src={news.image_url} alt={news.title} className="w-full h-64 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                {news.tag && <span className="bg-blue/10 text-blue text-sm px-3 py-1 rounded-full">{news.tag}</span>}
                <span className="text-text-muted text-sm">{formatDate(news.created_at)}</span>
              </div>
              <div className="prose prose-lg max-w-none text-text-primary leading-relaxed">
                {news.content.split("\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}