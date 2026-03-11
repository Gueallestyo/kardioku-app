import { useState } from 'react';
import { Heart, ChevronDown, RotateCcw, Activity, Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { UserProfile, AssessmentRecord, saveAssessment } from '@/lib/store'; 
import RiskGauge from './RiskGauge';
import axios from 'axios';

interface Props {
  user: UserProfile;
  onNewRecord: (r: AssessmentRecord) => void;
}

const KOLESTEROL_OPTIONS = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Di Atas Normal' },
  { value: 3, label: 'Jauh Di Atas Normal' },
];

const GLUKOSA_OPTIONS = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Di Atas Normal' },
  { value: 3, label: 'Jauh Di Atas Normal' },
];

// KOMPONEN TABEL EDUKASI (Tampil setelah hasil keluar)
function EducationTable() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mt-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-primary" />
        Referensi Tekanan Darah Klinis (mmHg)
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-success-light border border-success/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success">Normal (Aman)</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <p>Sistolik: <span className="font-medium text-foreground">&lt; 120</span></p>
              <p>Diastolik: <span className="font-medium text-foreground">&lt; 80</span></p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-warning-light border border-warning/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning">Pra-Hipertensi (Rentan)</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <p>Sistolik: <span className="font-medium text-foreground">120 - 139</span></p>
              <p>Diastolik: <span className="font-medium text-foreground">80 - 89</span></p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-destructive-light border border-destructive/20 rounded-lg">
          <AlertOctagon className="w-5 h-5 text-destructive flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">Hipertensi (Bahaya)</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <p>Sistolik: <span className="font-medium text-foreground">&ge; 140</span></p>
              <p>Diastolik: <span className="font-medium text-foreground">&ge; 90</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentTab({ user, onNewRecord }: Props) {
  const bmi = user.tinggiBadan > 0
    ? parseFloat((user.beratBadan / Math.pow(user.tinggiBadan / 100, 2)).toFixed(1))
    : 0;

  const bmiCategory = bmi < 18.5 ? 'Kurus' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Berlebih' : 'Obesitas';

  const [sistolik, setSistolik] = useState('');
  const [diastolik, setDiastolik] = useState('');
  const [kolesterol, setKolesterol] = useState(1);
  const [glukosa, setGlukosa] = useState(1);
  const [merokok, setMerokok] = useState(0);
  const [alkohol, setAlkohol] = useState(0);
  const [aktivitas, setAktivitas] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentRecord | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const s = parseInt(sistolik);
    const d = parseInt(diastolik);
    if (!s || !d || s < 60 || s > 300 || d < 40 || d > 200) {
      setError('Nilai tekanan darah tidak valid. Sistolik: 60-300, Diastolik: 40-200 mmHg.');
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        user_id: Number((user as any).id) || 1, 
        umur_tahun: user.umur || 0,
        jenis_kelamin: user.jenisKelamin === 'Wanita' ? 1 : 2,
        tinggi_badan: user.tinggiBadan || 0,
        berat_badan: user.beratBadan || 0,
        sistolik: s,
        diastolik: d,
        kolesterol,
        glukosa,
        merokok,
        konsumsi_alkohol: alkohol,
        aktivitas_fisik: aktivitas
      };

      const response = await axios.post('https://allestyo-api-kardioku.hf.space/prediksi', payload);

      if (response.data.status_kode === 200) {
        const hasil = response.data.hasil_prediksi;
        let level: 'Rendah' | 'Sedang' | 'Tinggi' = 'Rendah';
        if (hasil.indikator_warna === 'Kuning') level = 'Sedang';
        if (hasil.indikator_warna === 'Merah') level = 'Tinggi';

        const record: AssessmentRecord = {
          id: Date.now().toString(),
          tanggal: new Date().toISOString().split('T')[0],
          sistolik: s,
          diastolik: d,
          kolesterol,
          glukosa,
          merokok,
          alkohol,
          aktivitasFisik: aktivitas,
          bmi,
          riskScore: hasil.persentase_risiko,
          riskLevel: level,
        };

        saveAssessment(user.username, record);
        setResult(record);
        onNewRecord(record);
      } else {
        setError('Terjadi masalah saat membaca hasil dari server.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke API. Pastikan server Python Backend menyala!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSistolik('');
    setDiastolik('');
    setKolesterol(1);
    setGlukosa(1);
    setMerokok(0);
    setAlkohol(0);
    setAktivitas(1);
    setAccordionOpen(false);
    setError('');
  };

  const riskColors = {
    Rendah: { bg: 'bg-success-light', border: 'border-success/30', text: 'text-success', badge: 'bg-success text-success-foreground' },
    Sedang: { bg: 'bg-warning-light', border: 'border-warning/30', text: 'text-warning', badge: 'bg-warning text-warning-foreground' },
    Tinggi: { bg: 'bg-destructive-light', border: 'border-destructive/30', text: 'text-destructive', badge: 'bg-destructive text-destructive-foreground' },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in-up">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Heart className="w-12 h-12 text-primary animate-heart" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Sistem Kardioku Sedang Menganalisis...</p>
          <p className="text-sm text-muted-foreground">Mengekstraksi pola dengan Machine Learning</p>
          <div className="flex items-center gap-1 justify-center mt-3">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-primary animate-blink"
                style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // JIKA HASIL PREDIKSI KELUAR
  if (result) {
    const c = riskColors[result.riskLevel];
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className={`rounded-2xl border p-6 ${c.bg} ${c.border}`}>
          <div className="text-center mb-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge}`}>
              HASIL PREDIKSI
            </span>
          </div>
          
          <RiskGauge score={result.riskScore} level={result.riskLevel} />
          
          <div className="text-center mt-2 pb-4">
            <p className={`text-2xl font-extrabold ${c.text}`}>
              Status: {result.riskLevel === 'Tinggi' ? 'BERISIKO TINGGI! ⚠️' :
                       result.riskLevel === 'Sedang' ? 'PRE-HIPERTENSI ⚡' : 'AMAN ✅'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Probabilitas Risiko: <strong>{result.riskScore}%</strong> — {result.tanggal}
            </p>
          </div>
        </div>

        {/* Tabel Edukasi Klinis */}
        <EducationTable />

        {/* Summary Grid (Tensi & BMI) */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-card border border-border rounded-xl p-4 print:p-6 print:border-2">
            <p className="text-xs text-muted-foreground font-medium print:text-sm">Tekanan Darah</p>
            <p className="text-xl font-bold text-foreground print:text-2xl">{result.sistolik}/{result.diastolik}</p>
            <p className="text-xs text-muted-foreground print:text-sm">mmHg</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 print:p-6 print:border-2">
            <p className="text-xs text-muted-foreground font-medium print:text-sm">Indeks Massa Tubuh</p>
            <p className="text-xl font-bold text-foreground print:text-2xl">{result.bmi}</p>
            <p className="text-xs text-muted-foreground print:text-sm">kg/m² · {bmiCategory}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mt-4 print:mb-0">
          <h4 className="font-semibold text-foreground text-sm mb-2">💡 Rekomendasi</h4>
          <p className="text-sm text-muted-foreground">
            {result.riskLevel === 'Tinggi'
              ? 'Segera konsultasikan kondisi Anda ke dokter atau tenaga medis profesional. Hindari aktivitas berat dan pantau tekanan darah secara rutin.'
              : result.riskLevel === 'Sedang'
              ? 'Pertahankan gaya hidup sehat, tingkatkan aktivitas fisik, dan batasi konsumsi garam. Lakukan pemeriksaan rutin setiap 3 bulan.'
              : 'Terus jaga gaya hidup sehat Anda dengan pola makan seimbang dan olahraga teratur. Lakukan pemeriksaan tensi rutin untuk pemantauan.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 print:hidden">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-hero text-primary-foreground font-medium shadow-primary hover:opacity-90 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Pemeriksaan Baru
          </button>
        </div>
      </div>
    );
  }

  // HALAMAN INPUT FORM (BELUM ADA HASIL)
  return (
    <form onSubmit={handleAnalyze} className="space-y-5">
      <div className="gradient-hero rounded-xl p-4 text-primary-foreground flex items-center justify-between shadow-primary">
        <div>
          <p className="text-xs opacity-75">Indeks Massa Tubuh (BMI)</p>
          <p className="text-3xl font-extrabold">{bmi || '—'}</p>
          <p className="text-xs opacity-75">kg/m² · {bmiCategory}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs opacity-75">
          <p>{user.tinggiBadan} cm</p>
          <p>{user.beratBadan} kg</p>
          <p>{user.umur} tahun · {user.jenisKelamin}</p>
        </div>
      </div>

      {/* --- DESAIN TANDA VITAL DIKEMBALIKAN KE VERSI SIMPEL --- */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Tanda Vital <span className="text-destructive">*</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Sistolik */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Tekanan Sistolik</p>
            <div className="relative flex items-end">
              <input 
                type="number" 
                value={sistolik} 
                onChange={e => setSistolik(e.target.value)} 
                placeholder="0" 
                min={60} max={300} required 
                className="w-full text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none pb-1 transition-colors pr-6" 
              />
              <Heart className="absolute right-1 bottom-2 w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground">mmHg</p>
          </div>
          {/* Diastolik */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Tekanan Diastolik</p>
            <div className="relative flex items-end">
              <input 
                type="number" 
                value={diastolik} 
                onChange={e => setDiastolik(e.target.value)} 
                placeholder="0" 
                min={40} max={200} required 
                className="w-full text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none pb-1 transition-colors pr-6" 
              />
              <Activity className="absolute right-1 bottom-2 w-4 h-4 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground">mmHg</p>
          </div>
        </div>
      </div>
      {/* ------------------------------------------------------- */}

      <div className="border border-border rounded-xl overflow-hidden">
        <button type="button" onClick={() => setAccordionOpen(!accordionOpen)} className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors text-left">
          <span className="font-medium text-foreground text-sm">⚙️ Sesuaikan Gaya Hidup (Opsional)</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${accordionOpen ? 'rotate-180' : ''}`} />
        </button>
        {accordionOpen && (
          <div className="p-4 border-t border-border bg-background animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kadar Kolesterol</label>
                <select value={kolesterol} onChange={e => setKolesterol(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {KOLESTEROL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kadar Glukosa</label>
                <select value={glukosa} onChange={e => setGlukosa(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {GLUKOSA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kebiasaan Merokok</label>
                <select value={merokok} onChange={e => setMerokok(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Tidak Merokok</option>
                  <option value={1}>Perokok Aktif</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Konsumsi Alkohol</label>
                <select value={alkohol} onChange={e => setAlkohol(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Tidak Mengonsumsi</option>
                  <option value={1}>Mengonsumsi Alkohol</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Tingkat Aktivitas Fisik</label>
                <select value={aktivitas} onChange={e => setAktivitas(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Tidak Aktif (Sedentari)</option>
                  <option value={1}>Aktif (Olahraga Rutin)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive-light border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading} className="w-full py-4 rounded-xl gradient-hero text-primary-foreground font-bold text-base shadow-primary hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70">
        <Heart className="w-5 h-5" />
        Analisis Risiko Jantung
      </button>
    </form>
  );
}