# MTS Tumpat — Rekod Hafazan Grub Abi Hisyam

Website pemantauan hafazan harian santri **Grub Abi Hisyam (MTS Tumpat)** dengan tampilan visual 3D taman bunga & pohon rindang yang cerah (Three.js / WebGL), animasi tipografi (Framer Motion), serta panel statistik dan **Mod Ustaz** untuk pengelolaan data hafazan.

## Fitur Utama

- **Taman Bunga 3D Cerah (Welcome Page)**: Lanskap 3D real-time dengan bunga berayun tertiup angin, kupu-kupu terbang, awan bergerak, matahari pagi, dan paralaks kamera interaktif.
- **Pohon Rindang 3D (Bagian Fitur)**: Pohon rindang 3D dengan kanopi berlapis, bunga di tajuk daun, serta dedaunan sejuk yang melayang turun.
- **Rekod & Statistik 11 Santri**:
  - Pemilih pelajar dan rentang waktu (`1 hari`, `1 minggu`, `1 bulan`, `3 bulan`, `6 bulan`, `1 tahun`).
  - Ringkasan status (`Telah Menghantar`, `Tidak Menghantar`, `Sakit`, `Izin`) dan pencapaian juzuk terkini.
  - Grafik **Kalendar Heatmap**, **Diagram Donat**, **Grafik Tren Batang**, **Perbandingan Semua Pelajar**, dan **Rekod Harian**.
- **Mod Ustaz**: Pengisian status harian santri, pencatatan juzuk & muka surat tetap, penyimpanan draf otomatis di `localStorage`, serta ekspor `data.js`.

---

## Cara Publish ke GitHub Pages (Link Publik)

Repositori ini sudah dilengkapi file workflow otomatis di `.github/workflows/deploy.yml` dan konfigurasi `base: './'` di `vite.config.ts`.

### Langkah-langkah:

1. **Unduh / Siapkan File Proyek**
   Pastikan seluruh isi proyek ini (termasuk folder `src/`, `.github/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, `README.md`) masuk ke repositori GitHub Anda.
   > Catatan: Folder `node_modules/` dan `dist/` tidak perlu di-upload (sudah diabaikan oleh `.gitignore`).

2. **Upload / Push ke GitHub**
   Jika menggunakan terminal/Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Website Rekod Hafazan MTS Tumpat 3D"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages (Pilih salah satu opsi)**

   **Opsi A — Paling Mudah (Deploy from a branch `/docs`):**
   - Buka repositori Anda di GitHub → **Settings** → **Pages**.
   - Pada **Build and deployment → Source**, pilih **Deploy from a branch**.
   - Pilih Branch: **`main`** dan Folder: **`/docs`** (lalu klik **Save**).
   - Folder `docs/` sudah berisi hasil *build* siap pakai (`index.html` + `assets/`).

   **Opsi B — Otomatis dengan GitHub Actions:**
   - Pastikan folder `.github/workflows/deploy.yml` ikut masuk ke repositori.
   - Buka **Settings** → **Pages** → **Source**, pilih **GitHub Actions**.

   Tunggu 1–2 menit, lalu buka link publik Anda di:
   `https://USERNAME.github.io/NAMA-REPO/`

---

## Menjalankan di Komputer Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan mode pengembangan
npm run dev

# 3. Build versi produksi (hasil di folder dist/)
npm run build
```

## Memperbarui Data Santri

Data awal tersimpan di `src/data/tahfizData.ts`. Anda dapat mengeditnya langsung di file tersebut sebelum melakukan `git push`, atau menggunakan **Mod Ustaz** langsung di website untuk mencatat perubahan harian secara cepat.
