import ssl
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# KREDENSIAL DATABASE
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://avnadmin:AVNS_fwZJdbynqEVjm8slSFe@kardioku-db-kardioku.a.aivencloud.com:27835/defaultdb"

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Membuat penghubung Python dengan MySQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"ssl": ssl_context}
)

# Membuat sesi komunikasi
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fondasi dasar untuk membuat tabel otomatis
Base = declarative_base()

print("Koneksi ke arsitektur database Kardioku berhasil disiapkan!")