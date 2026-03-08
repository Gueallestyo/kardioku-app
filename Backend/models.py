from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==========================================
# TABEL 1: DATA PENGGUNA (users)
# ==========================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nama_pengguna = Column(String(50), nullable=True) 
    email = Column(String(100), unique=True, index=True)
    kata_sandi = Column(String(255), nullable=True) 
    google_id = Column(String(255), unique=True, nullable=True)
    foto_profil = Column(String(500), nullable=True)
    
    # Profil Fisik Dasar (Dari Halaman Onboarding)
    umur_tahun = Column(Integer, nullable=True)
    jenis_kelamin = Column(Integer, nullable=True) 
    tinggi_badan = Column(Float, nullable=True)
    berat_badan = Column(Float, nullable=True)

    # Relasi: 1 User bisa punya BANYAK Riwayat Pemeriksaan
    riwayat = relationship("RiwayatPemeriksaan", back_populates="pemilik")


# ==========================================
# TABEL 2: REKAM MEDIS & PREDIKSI (riwayat_pemeriksaan)
# ==========================================
class RiwayatPemeriksaan(Base):
    __tablename__ = "riwayat_pemeriksaan"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tanggal_periksa = Column(DateTime, default=datetime.utcnow)
    
    # Input Tanda Vital & Gaya Hidup
    tensi_sistolik = Column(Integer)
    tensi_diastolik = Column(Integer)
    kolesterol = Column(Integer)
    glukosa = Column(Integer)
    merokok = Column(Boolean)
    konsumsi_alkohol = Column(Boolean)
    aktivitas_fisik = Column(Boolean)
    
    # Hasil Kalkulasi
    bmi_score = Column(Float)
    klaster_ai = Column(Integer)
    status_risiko = Column(String(50))

    # Relasi balik: 1 Riwayat dimiliki oleh 1 User
    pemilik = relationship("User", back_populates="riwayat")