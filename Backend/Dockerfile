# 1. Gunakan sistem operasi dasar Python 3.12 versi ringan
FROM python:3.12-slim

# 2. Tentukan direktori kerja di dalam kontainer
WORKDIR /app

# 3. Salin isi file requirements.txt ke dalam kontainer
COPY requirements.txt .

# 4. Install semua pustaka yang dibutuhkan aplikasi
RUN pip install --no-cache-dir -r requirements.txt

# 5. Salin seluruh kode Python ke dalam kontainer
COPY . .

# 6. Beri tahu sistem bahwa aplikasi Kardioku akan menggunakan pintu nomor 8080
EXPOSE 7860

# 7. Perintah wajib untuk menyalakan server saat kontainer hidup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]