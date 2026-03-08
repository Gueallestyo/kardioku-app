import React from 'react';

interface Props {
  score: number;
  level: 'Rendah' | 'Sedang' | 'Tinggi';
}

export default function RiskGauge({ score, level }: Props) {
  // Membatasi persentase di rentang 0 - 100
  const percentage = Math.min(Math.max(score, 0), 100);
  
  // Menghitung rotasi jarum (0% = 0 derajat, 100% = 180 derajat)
  const rotation = (percentage / 100) * 180;

  // Mengatur warna jarum & angka sesuai status
  let colorHex = '#10b981'; // Hijau (Aman)
  if (level === 'Sedang') colorHex = '#f59e0b'; // Kuning (Waspada)
  if (level === 'Tinggi') colorHex = '#ef4444'; // Merah (Bahaya)

  return (
    // pb-12 ditambahkan untuk memberi ruang ekstra antara angka dan tulisan Status
    // pt-12 dan pb-16 memberi ruang bernapas di atas dan bawah grafik
    <div className="flex flex-col items-center justify-center pt-12 pb-16 w-full animate-fade-in relative">
      <div className="relative w-64 h-32">
        
        {/* SVG Grafik Gauge Bawaan Asli Lovable (Tanpa Teks) */}
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible drop-shadow-sm">
          {/* Segmen Hijau (Rendah) */}
          <path d="M 20 100 A 80 80 0 0 1 70 38" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />
          
          {/* Segmen Kuning (Sedang) */}
          <path d="M 70 38 A 80 80 0 0 1 130 38" fill="none" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
          
          {/* Segmen Merah (Tinggi) */}
          <path d="M 130 38 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />

          {/* Jarum Pointer */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <line x1="30" y1="100" x2="90" y2="100" stroke={colorHex} strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="white" stroke={colorHex} strokeWidth="5" />
          </g>
        </svg>

        {/* --- SOLUSI UTAMA: Label Teks didorong ke luar/atas busur --- */}
        <span className="absolute -top-1 left-[15px] text-[12px] font-semibold text-success">Rendah</span>
        {/* Label Sedang didorong lebih ke atas (-top-12) agar tidak tertutup */}
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[12px] font-semibold text-warning">Sedang</span>
        <span className="absolute -top-1 right-[15px] text-[12px] font-semibold text-destructive">Tinggi</span>
        {/* ------------------------------------------------------------------ */}

        {/* Tampilan Skor Risiko & Probabilitas (Ditarik sedikit lebih ke atas -bottom-6) */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
          <span className="text-4xl font-extrabold tracking-tight" style={{ color: colorHex }}>
            <span className="text-xl font-bold">Skor:</span> {score.toFixed(0)}
          </span>
        </div>
        
      </div>
    </div>
  );
}