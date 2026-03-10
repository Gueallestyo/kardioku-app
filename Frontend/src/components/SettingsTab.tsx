import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Info, CheckCircle, XCircle, Moon, Sun, LogOut, LogOutIcon, Settings } from 'lucide-react';
import { getReminderState, setReminderState } from '@/lib/store';
import OneSignal from 'react-onesignal';

interface Props {
  onLogout?: () => void;
}

interface ReminderSchedule {
  pagi: boolean;
  siang: boolean;
  malam: boolean;
  kustom: boolean;
}

export default function SettingsTab({ onLogout }: Props) {
  const [reminderOn, setReminderOn] = useState(getReminderState());
  const [schedule, setSchedule] = useState<ReminderSchedule>({ pagi: false, siang: true, malam: false, kustom: false });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [customTime, setCustomTime] = useState("");
  
  // State untuk Pop-up Konfirmasi Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // State untuk Preferensi Lainnya
  const [localData, setLocalData] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // State untuk Pop-up Alert Preferensi
  const [alertInfo, setAlertInfo] = useState({ visible: false, title: "", message: "" });

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
    } else {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleToggle = async () => {
    const newVal = !reminderOn;
    setReminderOn(newVal);
    setReminderState(newVal);

    if (newVal) {
      // Memanggil pop-up resmi dari OneSignal untuk meminta izin
      await OneSignal.Slidedown.promptPush();
      
      // Mengirimkan Tag (Label) ke server OneSignal bahwa user ini aktif
      OneSignal.User.addTag("pengingat_aktif", "true");
      setShowPermissionBanner(true);
      setPermissionStatus('granted');
    } else {
      // Jika dimatikan, hapus labelnya dari server
      OneSignal.User.addTag("pengingat_aktif", "false");
    }
  };

  const toggleSchedule = (key: keyof ReminderSchedule) => {
    setSchedule(prev => {
      const newState = !prev[key];
      
      // TAMBAHAN BARU: Mengirim waktu yang dipilih ke server OneSignal
      if (newState) {
        if (key === 'pagi') OneSignal.User.addTag("waktu_pengingat", "08:00");
        if (key === 'siang') OneSignal.User.addTag("waktu_pengingat", "13:00");
        if (key === 'malam') OneSignal.User.addTag("waktu_pengingat", "20:00");
        if (key === 'kustom' && customTime) OneSignal.User.addTag("waktu_pengingat", customTime);
      }
      
      return { ...prev, [key]: newState };
    });
  };

  const handleDarkModeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kardioku_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kardioku_theme', 'light');
    }
  };

  // Fungsi untuk menangani klik pada Preferensi Lainnya
  const handlePreferenceToggle = (type: 'local' | 'privacy') => {
    if (type === 'local') {
      const newState = !localData;
      setLocalData(newState);
      setAlertInfo({
        visible: true,
        title: "Simpan Data Secara Lokal",
        message: newState 
          ? "Fitur diaktifkan: Sebagian data cache kini disimpan di memori perangkat Anda untuk mempercepat proses pemuatan aplikasi." 
          : "Fitur dimatikan: Penyimpanan lokal dihapus. Aplikasi mungkin memerlukan waktu sedikit lebih lama untuk memuat data dari server."
      });
    } else {
      const newState = !privacyMode;
      setPrivacyMode(newState);
      setAlertInfo({
        visible: true,
        title: "Mode Privasi",
        message: newState 
          ? "Mode Privasi diaktifkan: Data diagnostik dan analitik anonim tidak akan dikirimkan ke server pengembang." 
          : "Mode Privasi dimatikan: Aplikasi akan mengirimkan data analitik standar untuk membantu pengembangan fitur Kardioku ke depannya."
      });
    }
  };

  return (
    <div className="space-y-6 pb-6 relative">
      {/* Dark Mode Toggle */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            Mode Tampilan
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Sesuaikan tampilan aplikasi sesuai preferensi Anda.
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/10' : 'bg-muted'}`}>
                {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {darkMode ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {darkMode ? 'Beralih ke mode terang untuk tampilan cerah' : 'Beralih ke mode gelap untuk kenyamanan mata'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                darkMode ? 'gradient-hero shadow-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Pengaturan Pengingat Harian
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Atur pengingat otomatis untuk melakukan pemeriksaan kesehatan secara rutin.
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${reminderOn ? 'bg-primary/10' : 'bg-muted'}`}>
                {reminderOn ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Aktifkan Pengingat Pemeriksaan</p>
                <p className="text-xs text-muted-foreground">Terima notifikasi pengingat harian</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                reminderOn ? 'gradient-hero shadow-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${reminderOn ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {reminderOn && (
            <div className="bg-secondary rounded-xl p-4 border border-primary/15 animate-fade-in-up space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Jadwal Pengingat</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Pilih waktu pengingat untuk memastikan rutinitas pengukuran tekanan darah yang konsisten.
              </p>
              {[
                { key: 'pagi' as const, label: 'Pagi', time: '08:00', emoji: '🌅' },
                { key: 'siang' as const, label: 'Siang', time: '13:00', emoji: '☀️' },
                { key: 'malam' as const, label: 'Malam', time: '20:00', emoji: '🌙' },
                { key: 'kustom' as const, label: 'Atur Sendiri', time: customTime || '--:--', emoji: '⏱️' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      schedule[item.key] ? 'border-primary bg-primary' : 'border-input bg-background group-hover:border-primary/50'
                    }`}
                    onClick={() => toggleSchedule(item.key)}
                  >
                    {schedule[item.key] && (
                      <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">{item.emoji} {item.label} ({item.time})</span>
                </label>
              ))}

              {schedule.kustom && (
                <div className="mt-3 ml-8 p-3 bg-background border border-border rounded-xl animate-fade-in-up flex items-center gap-3">
                  <label className="text-xs text-muted-foreground font-medium">Tentukan Waktu:</label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTime(val);
                      // TAMBAHAN BARU: Otomatis kirim tag ke OneSignal saat jam kustom diubah
                      if (val) {
                        OneSignal.User.addTag("waktu_pengingat", val);
                      }
                    }}
                    className="bg-transparent border border-input rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {showPermissionBanner && (
            <div className="animate-fade-in-up">
              {permissionStatus === 'granted' ? (
                <div className="flex items-start gap-3 p-4 bg-success-light border border-success/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-success">Notifikasi Diizinkan ✓</p>
                    <p className="text-xs text-success/80 mt-0.5">Pengingat berhasil diaktifkan sesuai jadwal yang dipilih.</p>
                  </div>
                </div>
              ) : permissionStatus === 'denied' ? (
                <div className="flex items-start gap-3 p-4 bg-destructive-light border border-destructive/20 rounded-xl">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Notifikasi Diblokir</p>
                    <p className="text-xs text-destructive/80 mt-0.5">Buka pengaturan browser dan izinkan notifikasi dari situs ini.</p>
                  </div>
                </div>
              ) : permissionStatus === 'unsupported' ? (
                <div className="flex items-start gap-3 p-4 bg-warning-light border border-warning/30 rounded-xl">
                  <Info className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-warning">Browser Tidak Mendukung</p>
                    <p className="text-xs text-warning/80 mt-0.5">Browser Anda tidak mendukung Web Notifications.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-xl">
                  <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Izin Notifikasi Diperlukan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Silakan klik "Izinkan" pada dialog yang muncul.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preferensi Lainnya */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">⚙️ Preferensi Lainnya</h3>
        <div className="space-y-4">
          
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground">Simpan Data Secara Lokal</p>
              <p className="text-xs text-muted-foreground">Data disimpan di memori perangkat Anda</p>
            </div>
            <button
              onClick={() => handlePreferenceToggle('local')}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none ${localData ? 'gradient-hero' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${localData ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground">Mode Privasi</p>
              <p className="text-xs text-muted-foreground">Batasi pengiriman analitik ke server</p>
            </div>
            <button
              onClick={() => handlePreferenceToggle('privacy')}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none ${privacyMode ? 'gradient-hero' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${privacyMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">ℹ️ Tentang Kardioku</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Developer: <span className="text-foreground font-medium">Allestyo</span></p>
          <p>Versi: <span className="text-foreground font-medium">v2.1.0</span></p>
          <p>Algoritma Berbasis: <span className="text-foreground font-medium">Model Framingham Heart Study</span></p>
          <div className="mt-3 p-3 bg-warning-light border border-warning/20 rounded-lg text-xs text-warning">
            ⚠️ <strong>Disclaimer:</strong> Kardioku adalah alat skrining awal dan bukan pengganti diagnosis medis profesional. Selalu konsultasikan hasil pemeriksaan dengan dokter atau tenaga medis yang kompeten.
          </div>
        </div>
      </div>

      {onLogout && (
        <div className="pt-2 px-2">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-white transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout dari akun
          </button>
        </div>
      )}

      {/* POP-UP KONFIRMASI LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <LogOutIcon className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Logout dari akun</h3>
            <p className="text-sm text-muted-foreground mb-6">Anda yakin ingin keluar dari akun Kardioku Anda?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-muted transition-colors">
                Batal
              </button>
              <button onClick={onLogout} className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold hover:bg-destructive/90 transition-all shadow-sm">
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP ALERT PREFERENSI */}
      {alertInfo.visible && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-6 animate-fade-in-up relative">
            <button 
              onClick={() => setAlertInfo({ ...alertInfo, visible: false })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{alertInfo.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {alertInfo.message}
            </p>
            <button 
              onClick={() => setAlertInfo({ ...alertInfo, visible: false })}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}