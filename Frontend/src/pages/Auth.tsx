import { useState } from 'react';
import { Heart, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { setCurrentUser } from '@/lib/store';
import axios from 'axios';

// IMPORT LOGO BARU KARDIOKU
import kardiokuLogo from '@/assets/kardioku_logo.png'; 

interface AuthProps {
  onAuthenticated: () => void;
}

// Tambahan mode 'forgot-password'
type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Auth({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Untuk pesan sukses reset password
  const [loading, setLoading] = useState(false);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setKonfirmasi('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // 1. OTOMATIS UBAH USERNAME JADI HURUF KECIL SEMUA (Case Insensitive)
    const finalUsername = username.toLowerCase();

    // 2. LOGIKA VALIDASI KETAT (Hanya untuk Buat Akun & Lupa Sandi)
    if (mode === 'register' || mode === 'forgot-password') {
      // Cek Username: Hanya boleh huruf (a-z) dan angka (0-9), tanpa simbol/spasi
      const usernameRegex = /^[a-z0-9]+$/;
      if (!usernameRegex.test(finalUsername)) {
        setError('Nama pengguna hanya boleh berisi huruf dan angka (tanpa spasi atau simbol).');
        setLoading(false);
        return;
      }

      // Cek Password: Min 8 char, ada huruf besar, huruf kecil, angka, dan simbol
      const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/;
      if (!passwordRegex.test(password)) {
        setError('Kata sandi min. 8 karakter, wajib mengandung huruf besar, huruf kecil, angka, dan simbol khusus (!@#$%).');
        setLoading(false);
        return;
      }

      if (password !== konfirmasi) {
        setError('Konfirmasi kata sandi tidak cocok.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        // --- PROSES LOGIN (TIDAK CEK REGEX PASSWORD, BEBAS PAKAI AKUN LAMA) ---
        const response = await axios.post('http://127.0.0.1:8000/login', {
          nama_pengguna: finalUsername,
          kata_sandi: password
        });

        if (response.data.status === 'Sukses') {
          const userData = response.data.data;
          const userForStore = {
            id: userData.id,
            username: userData.nama_pengguna,
            password: password,
            umur: userData.umur_tahun || 0,
            jenisKelamin: (userData.jenis_kelamin === 1 ? 'Wanita' : 'Pria') as 'Pria' | 'Wanita',
            tinggiBadan: userData.tinggi_badan || 0,
            beratBadan: userData.berat_badan || 0,
            isGoogleUser: !!userData.google_id,
          };
          setCurrentUser(userForStore);
          onAuthenticated();
        } else {
          setError(response.data.pesan || 'Nama pengguna atau kata sandi salah.');
        }

      } else if (mode === 'register') {
        // --- PROSES BUAT AKUN ---
        const response = await axios.post('http://127.0.0.1:8000/register', {
          nama_pengguna: finalUsername,
          email: `${finalUsername}@kardioku.com`, 
          kata_sandi: password,
          umur_tahun: 0,
          jenis_kelamin: 2, 
          tinggi_badan: 0,
          berat_badan: 0
        });

        if (response.data.status === 'Sukses') {
          const userData = response.data.data;
          const userForStore = {
            id: userData.id,
            username: userData.nama_pengguna,
            password: password,
            umur: 0,
            jenisKelamin: 'Pria' as const,
            tinggiBadan: 0,
            beratBadan: 0,
            isGoogleUser: false,
          };
          setCurrentUser(userForStore);
          onAuthenticated();
        } else {
          setError(response.data.pesan || 'Username mungkin sudah terdaftar.');
        }

      } else if (mode === 'forgot-password') {
        // --- PROSES LUPA KATA SANDI (RESET) ---
        const response = await axios.put('http://127.0.0.1:8000/reset_password', {
          nama_pengguna: finalUsername,
          kata_sandi_baru: password
        });

        if (response.data.status === 'Sukses') {
          setSuccessMsg(response.data.pesan);
          // Bersihkan form setelah sukses reset
          setUsername('');
          setPassword('');
          setKonfirmasi('');
          // Pindah ke mode login setelah 2 detik
          setTimeout(() => switchMode('login'), 2000);
        } else {
          setError(response.data.pesan || 'Gagal mereset kata sandi.');
        }
      }

    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server! Pastikan API Python Backend sudah menyala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary-glow)), transparent)' }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent)' }} />
      </div>

      <div className="w-full max-w-md relative">
        
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          <img src={kardiokuLogo} alt="Kardioku Logo" className="w-40 h-auto mx-auto mb-4 drop-shadow-md" />
          <p className="text-muted-foreground text-sm mt-1">Deteksi Dini Risiko Kardiovaskular</p>
        </div>

        {/* Card */}
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-border/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="mb-6 text-center"> 
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {mode === 'login' ? 'Masuk ke Akun Anda' : mode === 'register' ? 'Buat Akun Baru' : 'Reset Kata Sandi'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === 'login' ? 'Masukkan kredensial Anda untuk melanjutkan' : 
               mode === 'register' ? 'Daftarkan diri Anda untuk memulai pemantauan' :
               'Buat kata sandi baru yang kuat untuk akun Anda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Nama Pengguna</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} 
                placeholder={mode === 'forgot-password' ? "Nama pengguna yang ingin direset" : "Masukkan nama pengguna"} required
                className="w-full px-4 py-3 rounded-xl border border-input/60 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {mode === 'forgot-password' ? 'Kata Sandi Baru' : 'Kata Sandi'}
                </label>
                {/* TOMBOL LUPA SANDI (Hanya muncul di mode Login) */}
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('forgot-password')} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Lupa Kata Sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} 
                  placeholder={mode === 'login' ? "Masukkan kata sandi" : "Kombinasi huruf, angka & simbol"} required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-input/60 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {(mode === 'register' || mode === 'forgot-password') && (
              <div className="space-y-1.5 animate-fade-in-up">
                <label className="text-sm font-semibold text-foreground">Konfirmasi Kata Sandi</label>
                <input type={showPassword ? 'text' : 'password'} value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} placeholder="Ulangi kata sandi Anda" required
                  className="w-full px-4 py-3 rounded-xl border border-input/60 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
              </div>
            )}

            {/* Pesan Error / Sukses */}
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in-up">{error}</div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium animate-fade-in-up">{successMsg}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl gradient-hero text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>) : 
               (mode === 'login' ? 'Masuk ke Dashboard' : mode === 'register' ? 'Daftar Akun Sekarang' : 'Reset Kata Sandi')}
            </button>
          </form>

          <div className="text-center text-sm font-medium text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>Belum punya akun?{' '}<button onClick={() => switchMode('register')} className="text-primary hover:text-primary/80 transition-colors">Buat Akun Baru</button></>
            ) : (
              <>Sudah ingat atau punya akun?{' '}<button onClick={() => switchMode('login')} className="text-primary hover:text-primary/80 transition-colors">Masuk di sini</button></>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center gap-1.5 mt-8 text-[11px] text-muted-foreground/70 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
            <span>End-to-End Encrypted</span>
          </div>
          <span>Data medis Anda terenkripsi dan terlindungi dengan aman.</span>
        </div>
      </div>
    </div>
  );
}