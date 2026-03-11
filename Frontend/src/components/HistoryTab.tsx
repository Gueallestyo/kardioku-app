import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, FileText, Info, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// PERBAIKAN: Mengimpor getAssessments dari store
import { AssessmentRecord, getAssessments } from '@/lib/store'; 

// IMPORT ALAT PEMBUAT SURAT PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  user: any; 
}

type FilterMode = 'harian' | 'mingguan' | 'bulanan';

const riskBadge = (level: string) => {
  if (level === 'Tinggi' || level.includes('BAHAYA')) return 'bg-destructive-light text-destructive border border-destructive/20';
  if (level === 'Sedang' || level.includes('WASPADA')) return 'bg-warning-light text-warning border border-warning/30';
  return 'bg-success-light text-success border border-success/20';
};

const TIPS = [
  { emoji: '🚭', title: 'Hindari atau Berhenti Merokok', desc: 'Bahan kimia dalam rokok merusak pembuluh darah dan memaksa jantung bekerja lebih keras.' },
  { emoji: '🏃', title: 'Aktif Bergerak', desc: 'Rutin berolahraga 30-60 menit setiap hari membantu mengontrol berat badan dan terhindar dari obesitas.' },
  { emoji: '🥗', title: 'Konsumsi Makan Sehat dan Bergizi', desc: 'Perbanyak sayur, buah, biji-bijian. Batasi asupan garam, gula, dan lemak jenuh.' },
  { emoji: '⚖️', title: 'Pertahankan Berat Badan Sehat', desc: 'Pantau BMI Anda. Kelebihan berat badan berisiko memicu hipertensi dan penyakit jantung.' },
  { emoji: '😴', title: 'Dapatkan Tidur Berkualitas', desc: 'Tidur 7-9 jam setiap malam untuk mencegah hipertensi dan memulihkan tubuh.' },
  { emoji: '🧘', title: 'Kelola Stres dengan Baik', desc: 'Temukan metode relaksasi yang sehat. Hindari pelampiasan pada makanan berlebihan atau rokok.' },
];

export default function HistoryTab({ user }: Props) {
  const [filter, setFilter] = useState<FilterMode>('harian');
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // PERBAIKAN: Membaca data dari sumber lokal yang sama dengan Tab Pemeriksaan
  useEffect(() => {
    setLoading(true);
    try {
      if (user && user.username) {
        // Mengambil data yang 100% sinkron dengan sistem aplikasi
        const localData = getAssessments(user.username);
        setRecords(localData);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    } finally {
      // Memberikan sedikit efek loading agar UI terlihat natural
      setTimeout(() => setLoading(false), 300); 
    }
  }, [user]);

  const sliceCount = filter === 'harian' ? 7 : filter === 'mingguan' ? 14 : 30;

  const chartData = [...records].slice(0, sliceCount).reverse().map(r => ({
    tanggal: r.tanggal.slice(5),
    Sistolik: r.sistolik,
    Diastolik: r.diastolik,
  }));

  const last = records[0];
  const prev = records[1];
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (last && prev) {
    if (last.sistolik > prev.sistolik + 5) trend = 'up';
    else if (last.sistolik < prev.sistolik - 5) trend = 'down';
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-success' : 'text-muted-foreground';
  const trendText = trend === 'up'
    ? 'Tekanan darah Anda cenderung meningkat. Disarankan untuk berkonsultasi dengan dokter.'
    : trend === 'down'
    ? 'Tekanan darah Anda menunjukkan penurunan yang baik. Pertahankan gaya hidup sehat Anda!'
    : 'Tekanan darah Anda cenderung stabil. Terus jaga pola hidup sehat!';

  // =========================================================================
  // FUNGSI GENERATOR SURAT KETERANGAN MEDIS (PDF RESMI)
  // =========================================================================
  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Judul Kop Surat
    doc.setFontSize(22);
    doc.setTextColor(12, 130, 163); 
    doc.text('Kardio', 14, 22);
    doc.setTextColor(255, 75, 106); 
    doc.text('ku', 40, 22); 

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('SURAT KETERANGAN HASIL PEMERIKSAAN', 14, 32);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35); 

    // Data Diri Pasien
    doc.setFontSize(11);
    doc.text(`Nama Pasien    : ${user.username}`, 14, 45);
    doc.text(`Usia           : ${user.umur} Tahun`, 14, 52);
    doc.text(`Jenis Kelamin  : ${user.jenisKelamin}`, 14, 59);
    
    doc.text(`Tinggi Badan   : ${user.tinggiBadan} cm`, 110, 45);
    doc.text(`Berat Badan    : ${user.beratBadan} kg`, 110, 52);
    doc.text(`Tanggal Cetak  : ${new Date().toLocaleDateString('id-ID')}`, 110, 59);

    // Menyusun Data untuk Tabel Riwayat
    const tableColumn = ["No", "Tanggal", "Sistolik (mmHg)", "Diastolik (mmHg)", "BMI", "Status Risiko Medis"];
    const tableRows = records.map((r, index) => [
      (index + 1).toString(),
      r.tanggal,
      r.sistolik.toString(),
      r.diastolik.toString(),
      r.bmi.toString(),
      r.riskLevel
    ]);

    // Membuat Tabel
    autoTable(doc, {
      startY: 68,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [12, 130, 163] }, 
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Catatan Kaki / Disclaimer
    const finalY = (doc as any).lastAutoTable.finalY || 68;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Catatan Sistem Berbasis Algoritma Machine Learning:', 14, finalY + 15);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Laporan ini dihasilkan secara otomatis oleh algoritma Machine Learning Kardioku berdasarkan', 14, finalY + 22);
    doc.text('data tanda vital yang dimasukkan. Dokumen ini dapat digunakan sebagai referensi awal', 14, finalY + 27);
    doc.text('saat Anda melakukan konsultasi medis dengan dokter spesialis jantung.', 14, finalY + 32);

    // Mengunduh File Langsung ke Perangkat
    doc.save(`Laporan_Medis_Kardioku_${user.username}.pdf`);
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Sedang memuat data sinkronisasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Tren Tekanan Darah Nyata</h3>
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trend === 'up' ? 'Naik' : trend === 'down' ? 'Turun' : 'Stabil'}</span>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {(['harian', 'mingguan', 'bulanan'] as FilterMode[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'gradient-hero text-primary-foreground shadow-primary'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[60, 200]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Sistolik" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--destructive))', r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Diastolik" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Belum ada data pemeriksaan.
            </div>
          )}

          <div className="mt-4 p-3 bg-secondary rounded-xl border border-primary/15">
            <p className="text-xs font-semibold text-primary mb-1">Ringkasan</p>
            <p className="text-sm text-muted-foreground">{trendText}</p>
          </div>
        </div>

        {/* Clinical Decision Support Card */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Dukungan Keputusan</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Berdasarkan {records.length} data pemeriksaan, sistem merekomendasikan evaluasi rutin.
            </p>
            <div className="p-3 bg-secondary rounded-xl border border-primary/10 mb-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Rata-rata Sistolik:</strong>{' '}
                {records.length > 0 ? Math.round(records.reduce((a, r) => a + r.sistolik, 0) / records.length) : '—'} mmHg
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong className="text-foreground">Rata-rata Diastolik:</strong>{' '}
                {records.length > 0 ? Math.round(records.reduce((a, r) => a + r.diastolik, 0) / records.length) : '—'} mmHg
              </p>
            </div>
          </div>

          <button
            onClick={handleGeneratePDF}
            disabled={records.length === 0}
            className="w-full py-3 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-primary hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Unduh Surat Laporan (PDF)
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Tabel Riwayat</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Menampilkan data pemeriksaan terakhir Anda</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Sistolik</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Diastolik</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">BMI</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map((r, i) => (
                <tr key={r.id} className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 text-foreground font-medium">{r.tanggal}</td>
                  <td className="px-4 py-3 text-center text-foreground">{r.sistolik}</td>
                  <td className="px-4 py-3 text-center text-foreground">{r.diastolik}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{r.bmi}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskBadge(r.riskLevel)}`}>{r.riskLevel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && !loading && (
            <div className="py-10 text-center text-muted-foreground text-sm">Belum ada riwayat.</div>
          )}
        </div>
      </div>

      {/* 7 Tips Kesehatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPS.map((tip, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
              {tip.emoji}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}