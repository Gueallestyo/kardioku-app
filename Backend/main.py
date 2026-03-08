from fastapi import FastAPI
import joblib
import pandas as pd
import models, schemas
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import Depends
from database import SessionLocal
from passlib.context import CryptContext

# 1. Buat tabel otomatis di database (jika belum ada)
models.Base.metadata.create_all(bind=engine)

# 2. Inisialisasi Aplikasi
app = FastAPI(title="Kardioku API")

# Inisialisasi alat hashing password (mesin pengacak)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# 1. BUKA GEMBOK KEAMANAN (CORS)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# FUNGSI BANTUAN UNTUK MEMBUKA DATABASE
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 2. ENDPOINT REGISTRASI PENGGUNA
# ==========================================
@app.post("/register")
def daftar_pengguna(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Buat format data untuk dimasukkan ke tabel
    db_user = models.User(
        nama_pengguna=user.nama_pengguna,
        email=user.email,
        kata_sandi=user.kata_sandi, 
        umur_tahun=user.umur_tahun,
        jenis_kelamin=user.jenis_kelamin,
        tinggi_badan=user.tinggi_badan,
        berat_badan=user.berat_badan
    )
    # Simpan ke MySQL
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"status": "Sukses", "pesan": "Akun berhasil dibuat!", "data": db_user}

# ==========================================
# 3. ENDPOINT LOGIN PENGGUNA
# ==========================================
@app.post("/login")
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    
    # 1. Ubah inputan username jadi huruf kecil agar tidak case-sensitive
    username_lower = data.nama_pengguna.lower()
    db_user = db.query(models.User).filter(models.User.nama_pengguna == username_lower).first()
    
    if not db_user:
        return {"status": "Gagal", "pesan": "Nama pengguna atau kata sandi salah!"}
    
    # 2. LOGIKA PENGECEKAN KATA SANDI HYBRID
    is_password_correct = False
    
    # Cek Tipe 1: Kata sandi versi teks biasa (Legacy)
    if db_user.kata_sandi == data.kata_sandi:
        is_password_correct = True
    else:
        # Cek Tipe 2: Kata sandi versi Hash Modern
        try:
            # Menggunakan alat untuk memverifikasi apakah teks cocok dengan hash
            if pwd_context.verify(data.kata_sandi, db_user.kata_sandi):
                is_password_correct = True
        except Exception:
            # Jika terjadi error saat membandingkan (karena format hash aneh), abaikan saja
            pass

    # Jika kedua tipe pengecekan gagal
    if not is_password_correct:
        return {"status": "Gagal", "pesan": "Nama pengguna atau kata sandi salah!"}
        
    return {"status": "Sukses", "pesan": "Login berhasil!", "data": db_user}

# Muat Model Machine Learning ke Memori Server
print("Memuat model Kardioku...")
scaler = joblib.load("scaler_tensi.pkl")
kmeans = joblib.load("kmeans_model.pkl")
rf_model = joblib.load("rf_tuned_model.pkl")
print("Model Kardioku berhasil dimuat!")

@app.get("/")
def read_root():
    return {"status": "Sukses", "pesan": "API Kardioku Berjalan Normal!"}

# ==========================================
# 4. ENDPOINT PREDIKSI & SIMPAN RIWAYAT
# ==========================================
@app.post("/prediksi")
def prediksi_risiko(data: schemas.PrediksiInput, db: Session = Depends(get_db)):
    
    # Konversi data ke Pandas DataFrame
    input_data = pd.DataFrame([{
        "umur_tahun": data.umur_tahun, "jenis_kelamin": data.jenis_kelamin,
        "tinggi_badan": data.tinggi_badan, "berat_badan": data.berat_badan,
        "sistolik": data.sistolik, "diastolik": data.diastolik,
        "kolesterol": data.kolesterol, "glukosa": data.glukosa,
        "merokok": data.merokok, "konsumsi_alkohol": data.konsumsi_alkohol,
        "aktivitas_fisik": data.aktivitas_fisik
    }])

    # Proses (Scaler, K-Means, Random Forest)
    input_scaled = scaler.transform(input_data)
    input_scaled_df = pd.DataFrame(input_scaled, columns=input_data.columns)
    klaster_prediksi = kmeans.predict(input_scaled_df)[0]
    input_scaled_df["Klaster_KMeans"] = klaster_prediksi
    probabilitas = rf_model.predict_proba(input_scaled_df)[0][1]
    persentase_risiko = round(probabilitas * 100, 2)
    
    if klaster_prediksi == 2 and persentase_risiko < 45:
        status, warna = "AMAN", "Hijau"
    elif klaster_prediksi == 1 or persentase_risiko >= 60:
        status, warna = "BAHAYA (BERISIKO TINGGI)", "Merah"
    else:
        status, warna = "WASPADA (PRE-HIPERTENSI)", "Kuning"

    # ---------------------------------------------------------
    # SIMPAN HASIL KE DATABASE MYSQL
    # ---------------------------------------------------------
    kalkulasi_bmi = round(data.berat_badan / ((data.tinggi_badan / 100) ** 2), 2)
    
    db_riwayat = models.RiwayatPemeriksaan(
        user_id=data.user_id,
        tensi_sistolik=data.sistolik,
        tensi_diastolik=data.diastolik,
        kolesterol=data.kolesterol,
        glukosa=data.glukosa,
        merokok=bool(data.merokok),
        konsumsi_alkohol=bool(data.konsumsi_alkohol),
        aktivitas_fisik=bool(data.aktivitas_fisik),
        bmi_score=kalkulasi_bmi,
        klaster_ai=int(klaster_prediksi),
        status_risiko=status
    )
    db.add(db_riwayat)
    db.commit()

    return {
        "status_kode": 200,
        "hasil_prediksi": {
            "persentase_risiko": persentase_risiko,
            "klaster_pasien": int(klaster_prediksi),
            "status_medis": status,
            "indikator_warna": warna,
            "pesan_sistem": "Data riwayat berhasil disimpan ke Database!"
        }
    }

# ==========================================
# 5. ENDPOINT AMBIL RIWAYAT (UNTUK GRAFIK)
# ==========================================
@app.get("/riwayat/{user_id}")
def ambil_riwayat(user_id: int, db: Session = Depends(get_db)):
    # Cari semua riwayat milik user ini, urutkan dari yang terbaru
    riwayat = db.query(models.RiwayatPemeriksaan).filter(
        models.RiwayatPemeriksaan.user_id == user_id
    ).order_by(models.RiwayatPemeriksaan.tanggal_periksa.desc()).all()
    
    return {"status_kode": 200, "data": riwayat}

# ==========================================
# 6. ENDPOINT UPDATE PROFIL (ONBOARDING)
# ==========================================
@app.put("/update_profil/{user_id}")
def update_profil(user_id: int, profil: schemas.UserUpdate, db: Session = Depends(get_db)):
    # Cari pengguna di database
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        return {"status": "Gagal", "pesan": "Pengguna tidak ditemukan!"}
    
    # Timpa data lama (0) dengan data baru dari form
    db_user.umur_tahun = profil.umur_tahun
    db_user.jenis_kelamin = profil.jenis_kelamin
    db_user.tinggi_badan = profil.tinggi_badan
    db_user.berat_badan = profil.berat_badan
    
    # Simpan permanen ke MySQL
    db.commit()
    return {"status": "Sukses", "pesan": "Profil berhasil disimpan ke MySQL!"}

# ==========================================
# 7. ENDPOINT LUPA KATA SANDI
# ==========================================
@app.put("/reset_password")
def reset_password(data: schemas.PasswordReset, db: Session = Depends(get_db)):
    # Pastikan mencari dengan huruf kecil semua agar tidak case-sensitive
    username_lower = data.nama_pengguna.lower()
    db_user = db.query(models.User).filter(models.User.nama_pengguna == username_lower).first()
    
    if not db_user:
        return {"status": "Gagal", "pesan": "Nama pengguna tidak ditemukan di sistem!"}
    
    # Hash password baru yang sudah lolos validasi ketat dari Frontend
    hashed_password = pwd_context.hash(data.kata_sandi_baru)
    db_user.kata_sandi = hashed_password
    db.commit()
    
    return {"status": "Sukses", "pesan": "Kata sandi berhasil diubah! Silakan masuk."}