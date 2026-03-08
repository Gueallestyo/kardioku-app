import { useState, useMemo } from 'react';
import { User, Ruler, Weight, Calendar, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/lib/store';
import axios from 'axios';
import kardiokuLogoHati from '@/assets/kardio_logo.png';

interface Props {
  user: UserProfile;
  onComplete: (user: UserProfile) => void;
  onCancel: () => void; 
}

export default function Onboarding({ user, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  
  const [birthDay, setBirthDay] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<'Pria' | 'Wanita'>('Pria');
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatedAge = useMemo(() => {
    if (!birthDay || !birthMonth || !birthYear) return 0;
    const today = new Date();
    const dob = new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay));
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  }, [birthDay, birthMonth, birthYear]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleNextStep = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      setError('Mohon lengkapi tanggal, bulan, dan tahun lahir Anda.');
      return;
    }
    if (calculatedAge < 10) {
      setError('Maaf, usia minimal untuk menggunakan aplikasi ini adalah 10 tahun.');
      return;
    }
    setError('');
    setStep(2); 
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tinggiBadan || !beratBadan) {
      setError('Mohon lengkapi data fisik Anda.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        umur_tahun: calculatedAge,
        jenis_kelamin: jenisKelamin === 'Wanita' ? 1 : 2,
        tinggi_badan: Number(tinggiBadan),
        berat_badan: Number(beratBadan)
      };

      const userId = (user as any).id || 1;
      const response = await axios.put(`https://allestyo-api-kardioku.hf.space/update_profil/${userId}`, payload);

      if (response.data.status === 'Sukses') {
        const updatedUser: UserProfile = {
          ...user,
          umur: calculatedAge,
          jenisKelamin,
          tinggiBadan: Number(tinggiBadan),
          beratBadan: Number(beratBadan),
        };
        onComplete(updatedUser);
      } else {
        setError(response.data.pesan || 'Gagal menyimpan profil. Coba lagi.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server! Pastikan API Python Backend menyala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-background flex items-center justify-center mb-4">
            <img src={kardiokuLogoHati} alt="Kardioku Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Profil Fisik Dasar</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selamat datang, <strong className="text-primary">{user.username}</strong>! Mari lengkapi profil Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6 px-2">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <div className="bg-card/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-border/50 overflow-hidden relative">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1">
            
            {/* STEP 1: TANGGAL LAHIR & GENDER */}
            <div className={`col-start-1 row-start-1 flex flex-col transition-all duration-500 ease-in-out ${step === 1 ? 'translate-x-0 opacity-100 pointer-events-auto z-10' : '-translate-x-full opacity-0 pointer-events-none z-0'}`}>
              
              {/* --- TOMBOL KEMBALI KE LOGIN ADA DI SINI --- */}
              <button onClick={onCancel} className="mb-4 text-sm font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors self-start">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
              </button>

              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Tanggal Lahir
              </h3>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="w-full px-1.5 sm:px-3 py-3 rounded-xl border border-input/60 bg-background/50 text-xs sm:text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-ellipsis">
                  <option value="">Tanggal</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="w-full px-1.5 sm:px-3 py-3 rounded-xl border border-input/60 bg-background/50 text-xs sm:text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-ellipsis">
                  <option value="">Bulan</option>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-full px-1.5 sm:px-3 py-3 rounded-xl border border-input/60 bg-background/50 text-xs sm:text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-ellipsis">
                  <option value="">Tahun</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="mb-6 p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Usia Aktual Anda:</span>
                <span className="text-lg font-bold text-primary">{calculatedAge > 0 ? `${calculatedAge} Tahun` : '-'}</span>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Jenis Kelamin
              </h3>
              <select value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value as 'Pria' | 'Wanita')} className="w-full px-4 py-3 rounded-xl border border-input/60 bg-background/50 text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all">
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>

              <button onClick={handleNextStep} className="w-full mt-8 py-3.5 rounded-xl gradient-hero text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                Lanjut ke Fisik <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 2: TINGGI & BERAT BADAN */}
            <div className={`col-start-1 row-start-1 flex flex-col transition-all duration-500 ease-in-out ${step === 2 ? 'translate-x-0 opacity-100 pointer-events-auto z-10' : 'translate-x-full opacity-0 pointer-events-none z-0'}`}>
              <button onClick={handlePrevStep} className="mb-5 text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors self-start">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Data Diri
              </button>

              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" /> Postur Tubuh
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Tinggi Badan (cm)</label>
                  <div className="relative">
                    <input type="number" value={tinggiBadan} onChange={(e) => setTinggiBadan(e.target.value)} placeholder="Contoh: 170" min={50} max={250} required
                      className="w-full px-4 py-3 rounded-xl border border-input/60 bg-background/50 text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">cm</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Weight className="w-4 h-4" /> Berat Badan (kg)
                  </label>
                  <div className="relative">
                    <input type="number" value={beratBadan} onChange={(e) => setBeratBadan(e.target.value)} placeholder="Contoh: 65" min={10} max={300} required
                      className="w-full px-4 py-3 rounded-xl border border-input/60 bg-background/50 text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">kg</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-8 py-3.5 rounded-xl gradient-hero text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>) : 
                   (<><CheckCircle2 className="w-5 h-5" /> Simpan Profil & Mulai</>)}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}