from pydantic import BaseModel

# Skema data yang akan dikirim dari Frontend saat tombol "Analisis" ditekan
class PrediksiInput(BaseModel):
    user_id: int
    umur_tahun: int
    jenis_kelamin: int  # 1: Wanita, 2: Pria
    tinggi_badan: float
    berat_badan: float
    sistolik: int
    diastolik: int
    kolesterol: int     # 1: Normal, 2: Tinggi, 3: Sangat Tinggi
    glukosa: int        # 1: Normal, 2: Tinggi, 3: Sangat Tinggi
    merokok: int        # 0: Tidak, 1: Ya
    konsumsi_alkohol: int # 0: Tidak, 1: Ya
    aktivitas_fisik: int  # 0: Tidak, 1: Ya
    
# Skema data untuk mendaftarkan akun baru
class UserCreate(BaseModel):
    nama_pengguna: str
    email: str
    kata_sandi: str
    umur_tahun: int
    jenis_kelamin: int
    tinggi_badan: float
    berat_badan: float

# Skema data saat pengguna mencoba Login
class UserLogin(BaseModel):
    nama_pengguna: str
    kata_sandi: str

# Skema data untuk Update Profil Fisik (Onboarding)
class UserUpdate(BaseModel):
    umur_tahun: int
    jenis_kelamin: int
    tinggi_badan: float
    berat_badan: float

# Skema untuk mereset kata sandi
class PasswordReset(BaseModel):
    nama_pengguna: str
    kata_sandi_baru: str