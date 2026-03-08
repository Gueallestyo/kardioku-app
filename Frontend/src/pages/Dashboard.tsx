import { useState, useEffect } from 'react';
import { Heart, Activity, ClipboardList, Settings, ShieldCheck, Cloud, Edit2, Calendar, Ruler, Weight, X, Info, User, AlertCircle, Clock } from 'lucide-react';
import { UserProfile, AssessmentRecord, getAssessments, updateUserProfile, setCurrentUser as setGlobalUser } from '@/lib/store';
import AssessmentTab from '@/components/AssessmentTab';
import HistoryTab from '@/components/HistoryTab';
import SettingsTab from '@/components/SettingsTab'; 
import axios from 'axios';

// --- IMPORT LOGO KARDIOKU ---
import kardiokuLogoHati from '@/assets/kardio_logo.png';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

const TABS = [
  { id: 'pemeriksaan', label: 'Pemeriksaan', icon: Activity },
  { id: 'riwayat', label: 'Riwayat & Laporan', icon: ClipboardList },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

export default function Dashboard({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('pemeriksaan');
  const [records, setRecords] = useState<AssessmentRecord[]>(() => getAssessments(user.username));
  
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false); 
  const [currentUser, setCurrentUserLocal] = useState<UserProfile>(user);

  const [editUmur, setEditUmur] = useState(currentUser.umur.toString());
  const [editJenisKelamin, setEditJenisKelamin] = useState<'Pria' | 'Wanita'>(currentUser.jenisKelamin);
  const [editTinggi, setEditTinggi] = useState(currentUser.tinggiBadan.toString());
  const [editBerat, setEditBerat] = useState(currentUser.beratBadan.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setEditUmur(currentUser.umur.toString());
    setEditJenisKelamin(currentUser.jenisKelamin);
    setEditTinggi(currentUser.tinggiBadan.toString());
    setEditBerat(currentUser.beratBadan.toString());
  }, [currentUser]);

  const bmi = currentUser.tinggiBadan > 0
    ? (currentUser.beratBadan / Math.pow(currentUser.tinggiBadan / 100, 2)).toFixed(1)
    : '—';

  const handleNewRecord = (r: AssessmentRecord) => {
    setRecords(prev => [r, ...prev]);
  };

  const handleProfileSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true); 
  };

  const confirmSaveProfile = async () => {
    setShowSaveConfirm(false);
    setEditError('');
    setIsSaving(true);

    try {
      const payload = {
        umur_tahun: Number(editUmur),
        jenis_kelamin: editJenisKelamin === 'Wanita' ? 1 : 2,
        tinggi_badan: Number(editTinggi),
        berat_badan: Number(editBerat)
      };

      const userId = (currentUser as any).id || 1;
      const response = await axios.put(`http://127.0.0.1:8000/update_profil/${userId}`, payload);

      if (response.data.status === 'Sukses') {
        const updatedUser: UserProfile = {
          ...currentUser,
          umur: Number(editUmur),
          jenisKelamin: editJenisKelamin,
          tinggiBadan: Number(editTinggi),
          beratBadan: Number(editBerat)
        };
        
        updateUserProfile(currentUser.username, updatedUser);
        setGlobalUser(updatedUser);
        setCurrentUserLocal(updatedUser);
        
        setTimeout(() => setShowProfilePanel(false), 500); 
      } else {
        setEditError(response.data.pesan || 'Gagal menyimpan profil.');
      }
    } catch (err) {
      console.error(err);
      setEditError('Gagal terhubung ke server backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const Avatar = () => {
    if (currentUser.isGoogleUser) {
      return (
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=4285F4&color=fff&bold=true&size=32`}
          alt="Google Avatar"
          className="w-9 h-9 rounded-full object-cover shadow-sm border border-border"
        />
      );
    }
    return (
      <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm border border-border">
        {currentUser.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  const latestRecord = records.length > 0 ? records[0] : null;

  return (
    // PERBAIKAN PENTING 1: Menghapus overflow-x-hidden agar sistem Sticky bisa bekerja
    <div className="min-h-screen bg-background relative flex flex-col pb-[70px] sm:pb-0">
      
      {/* PERBAIKAN PENTING 2: Menambahkan sticky top-0 dan z-50 agar header selalu di atas */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Kiri */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-primary border border-primary/20 bg-background flex items-center justify-center">
              <img src={kardiokuLogoHati} alt="Kardioku Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#0c82a3]">Kardio</span>
              <span className="text-[#ff4b6a]">ku</span>
            </span>
            <div className="hidden md:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-success-light border border-success/20">
              <Cloud className="w-3 h-3 text-success" />
              <span className="text-[10px] font-medium text-success">Tersimpan Lokal</span>
            </div>
          </div>

          {/* Profil Kanan */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-primary/10 mr-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">Terenkripsi</span>
            </div>
            
            {/* PERBAIKAN PENTING 3: Username sekarang akan selalu terlihat di samping foto profil */}
            <div className="text-right flex flex-col justify-center mr-1">
              <p className="text-sm font-bold text-foreground">
                {currentUser.username}
              </p>
              {/* Menyembunyikan Umur & BMI di HP agar Header tidak terlalu berdesakan */}
              <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                {currentUser.umur} Th · BMI {bmi}
              </p>
            </div>
            
            <button 
              onClick={() => setShowProfilePanel(true)} 
              className="group flex items-center gap-2 outline-none rounded-full focus:ring-2 focus:ring-primary/40 transition-all hover:opacity-80"
              title="Buka Profil"
            >
              <Avatar />
            </button>
          </div>
        </div>
      </header>

      {/* DRAWER PANEL PROFIL */}
      {showProfilePanel && (
        <div 
          className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm transition-opacity" 
          onClick={() => setShowProfilePanel(false)} 
        />
      )}

      <div className={`fixed top-0 bottom-0 right-0 z-[70] w-full sm:w-[400px] bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-400 ease-in-out ${showProfilePanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profil Pengguna
          </h2>
          <button onClick={() => setShowProfilePanel(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">@{currentUser.username}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Akun Terverifikasi
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Informasi Akun</p>
            <p className="text-sm text-foreground">Terdaftar sebagai pengguna Kardioku App. Data fisik Anda disinkronkan secara lokal untuk keperluan analisis medis.</p>
          </div>

          <hr className="border-border" />

          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" /> Kelola Data Fisik
            </h3>
            
            <form onSubmit={handleProfileSubmitClick} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Umur Aktual
                  </label>
                  <input type="number" value={editUmur} disabled
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input/50 bg-muted/50 text-muted-foreground cursor-not-allowed outline-none" 
                  />
                  <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Terkunci (Sistem)
                  </p>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> Jenis Kelamin
                  </label>
                  <select value={editJenisKelamin} disabled
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input/50 bg-muted/50 text-muted-foreground cursor-not-allowed outline-none appearance-none">
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Terkunci (Paten)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Tinggi (cm)
                  </label>
                  <input type="number" value={editTinggi} onChange={e => setEditTinggi(e.target.value)} min={50} max={250} required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Berat (kg)
                  </label>
                  <input type="number" value={editBerat} onChange={e => setEditBerat(e.target.value)} min={10} max={300} required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
                </div>
              </div>

              {editError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {editError}
                </div>
              )}

              <button type="submit" disabled={isSaving}
                className="w-full py-3 mt-4 rounded-xl gradient-hero text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center">
                {isSaving ? 'Menyimpan...' : 'Perbarui Profil'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POP-UP KONFIRMASI SIMPAN PROFIL */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Konfirmasi Perubahan</h3>
            <p className="text-sm text-muted-foreground mb-6">Anda yakin ingin mengubah data diri fisik Anda? Ini dapat mempengaruhi hasil analisis.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSaveConfirm(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-muted transition-colors">
                Batal
              </button>
              <button onClick={confirmSaveProfile} className="flex-1 py-3 rounded-xl gradient-hero shadow-primary text-primary-foreground font-bold hover:opacity-90 transition-all">
                Ya, Perbarui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 sm:sticky sm:top-[65px] sm:bottom-auto z-40 bg-card/95 sm:bg-card/80 backdrop-blur-lg border-t sm:border-t-0 sm:border-b border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sm:shadow-none pb-safe">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex justify-around sm:justify-center gap-1 sm:gap-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 py-2 sm:py-3.5 px-1 sm:px-4 text-[10px] sm:text-sm border-t-2 sm:border-t-0 sm:border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary font-bold' 
                      : 'border-transparent text-muted-foreground font-medium hover:text-foreground sm:hover:border-border'
                  }`}
                >
                  <Icon className={`transition-all ${isActive ? 'w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5px] drop-shadow-sm' : 'w-5 h-5 sm:w-4 sm:h-4'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden block mt-0.5">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 overflow-x-hidden">
        {activeTab === 'pemeriksaan' && (
          <div className="animate-fade-in-up">
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {getGreeting()}, <span className="text-primary">{currentUser.username.split(' ')[0]}</span>! 👋
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pantau terus kesehatan jantung Anda hari ini.
              </p>
            </div>

            {latestRecord ? (
              <div className="mb-8 bg-gradient-to-br from-card to-card border border-primary/20 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
                
                <div className="relative z-10">
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Riwayat Pengecekan Terakhir ({latestRecord.tanggal})
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground">{latestRecord.sistolik}/{latestRecord.diastolik}</span>
                    <span className="text-sm text-muted-foreground mb-1 font-medium">mmHg</span>
                  </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-4 bg-background/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-border/50 self-start sm:self-auto">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Status Risiko</p>
                    <p className={`text-sm font-extrabold ${latestRecord.riskLevel === 'Tinggi' ? 'text-destructive' : latestRecord.riskLevel === 'Sedang' ? 'text-warning' : 'text-success'}`}>
                      {latestRecord.riskLevel.toUpperCase()}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${latestRecord.riskLevel === 'Tinggi' ? 'bg-destructive/10 text-destructive' : latestRecord.riskLevel === 'Sedang' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-secondary/50 border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Belum ada riwayat</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Lakukan pemeriksaan pertama Anda hari ini untuk melihat status jantung Anda.</p>
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-lg font-bold text-foreground">Pemeriksaan Baru</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Masukkan data vital Anda untuk dianalisis.</p>
            </div>
            <AssessmentTab user={currentUser} onNewRecord={handleNewRecord} />
          </div>
        )}
        
        {activeTab === 'riwayat' && (
          <div className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">Riwayat & Laporan Kesehatan</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Pantau perkembangan kondisi kardiovaskular Anda dari waktu ke waktu.</p>
            </div>
            {/* PERBAIKAN PENTING 4: Mengembalikan props records dan user ke HistoryTab */}
            <HistoryTab records={records} user={currentUser} />
          </div>
        )}
        
        {activeTab === 'pengaturan' && (
          <div className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">Pengaturan Aplikasi</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Kelola preferensi dan keamanan akun Anda.</p>
            </div>
            <SettingsTab onLogout={onLogout} />
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card/50 py-3 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground text-center">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>End-to-End Encrypted</span>
          </div>
          <span className="text-border">|</span>
          <span>© 2026 Kardioku App - All Rights Reserved</span>
        </div>
      </footer>

    </div>
  );
}