'use client';
import { useState } from 'react';
import Link from 'next/link';
import { lichChieu } from '@/lib/data';

export default function LichChieuPage() {
  const [day, setDay] = useState('HÔM NAY');

  const days = Object.keys(lichChieu);
  const current = lichChieu[day] || lichChieu[days[0]];

  return (
    <div className="px-4 py-4">
      <div className="mb-5 anim-fadeInUp d-1">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black grad-text">Lịch Chiếu</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
            {current.movies.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Theo dõi lộ trình các phần mới sắp lên sóng
        </p>
     
