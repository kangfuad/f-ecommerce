# Panduan Lengkap Setup Docker & CI/CD Deployment ke VPS

Dokumen ini adalah panduan langkah demi langkah untuk melakukan deploy otomatis aplikasi **e-punyasewa** dari repositori GitHub ke server VPS (*Virtual Private Server*) menggunakan **Docker**, **Docker Compose**, dan **GitHub Actions**.

---

## 1. Arsitektur CI/CD

```mermaid
flowchart LR
    A[Push ke branch 'main'] --> B[GitHub Actions]
    B --> C[Job 1: CI Build & Typecheck]
    C --> D[Job 2: SSH Deploy ke VPS]
    D --> E[VPS: Git Pull & Docker Build]
    E --> F[Kontainer Nginx SPA Berjalan :8080]
```

---

## 2. Langkah 1: Persiapan di Server VPS

### A. Install Docker & Docker Compose
Jalankan perintah berikut di terminal VPS Anda (Ubuntu/Debian):

```bash
# Update package list
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker via skrip resmi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user aktif ke grup docker (agar bisa run docker tanpa sudo)
sudo usermod -aG docker $USER

# Aktifkan service Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verifikasi instalasi
docker --version
docker compose version
```

### B. Siapkan Direktori Proyek di VPS
Buat direktori kerja untuk aplikasi, misalnya di `/var/www/epunyasewa`:

```bash
# Buat folder dan beri hak akses ke user aktif
sudo mkdir -p /var/www/epunyasewa
sudo chown -R $USER:$USER /var/www/epunyasewa

# Clone repository pertama kali
git clone https://github.com/<USERNAME>/<REPO_NAME>.git /var/www/epunyasewa

# Masuk ke direktori
cd /var/www/epunyasewa

# Buat file konfigurasi .env
cp .env.example .env
```

---

## 3. Langkah 2: Setup SSH Key untuk GitHub Actions

Agar GitHub Actions dapat mengakses VPS secara aman tanpa password:

### A. Buat Pasangan Kunci SSH (*SSH Key Pair*)
Di komputer lokal atau langsung di VPS, buat key baru:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
```

Perintah di atas menghasilkan 2 berkas:
1. `github_actions_deploy` (Private Key) — **Disimpan di GitHub Secrets**.
2. `github_actions_deploy.pub` (Public Key) — **Didaftarkan di VPS**.

### B. Daftarkan Public Key di VPS
Tambahkan isi `github_actions_deploy.pub` ke file `authorized_keys` di VPS:

```bash
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

## 4. Langkah 3: Konfigurasi GitHub Repository Secrets

Buka repositori GitHub Anda di browser, lalu masuk ke:
**Settings** → **Secrets and variables** → **Actions** → Klik **New repository secret**.

Tambahkan secret berikut satu per satu:

| Nama Secret | Nilai / Deskripsi | Contoh |
| :--- | :--- | :--- |
| `VPS_HOST` | Alamat IP Publik atau domain server VPS | `103.123.45.67` |
| `VPS_USERNAME` | Username SSH untuk masuk ke server | `root` atau `ubuntu` |
| `VPS_SSH_KEY` | Isi seluruh file **Private Key** (`github_actions_deploy`) | `-----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----` |
| `VPS_PORT` | Port SSH server (default 22) | `22` |
| `VPS_TARGET_DIR` | Lokasi folder proyek di server VPS | `/var/www/epunyasewa` |

---

## 5. Langkah 4: Uji Coba Deployment Otomatis

1. Lakukan *commit* dan *push* perubahan ke branch `main`:
   ```bash
   git add .
   git commit -m "feat: setup docker and ci/cd pipeline"
   git push origin main
   ```
2. Buka tab **Actions** di repositori GitHub Anda.
3. Anda akan melihat workflow **CI/CD Pipeline to VPS** berjalan secara otomatis:
   - **Job 1 (CI):** Memeriksa typecheck TypeScript dan memverifikasi build produksi.
   - **Job 2 (CD):** Melakukan koneksi SSH ke VPS, me-pull kode terbaru, dan menjalankan `docker compose up --build -d`.
4. Setelah selesai, akses web aplikasi di browser melalui: `http://<IP_VPS_ANDA>:8080`.

---

## 6. Langkah 5: Setup Domain & SSL HTTPS (Nginx Host + Certbot)

Untuk menghubungkan domain kustom (misal: `https://epunyasewa.com`) dengan sertifikat SSL Let's Encrypt gratis:

### A. Install Nginx di Host VPS
```bash
sudo apt-get install nginx certbot python3-certbot-nginx -y
```

### B. Buat Konfigurasi Virtual Host Reverse Proxy
Buat file `/etc/nginx/sites-available/epunyasewa`:

```nginx
server {
    server_name epunyasewa.com www.epunyasewa.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/epunyasewa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### C. Pasang Sertifikat SSL Otomatis
```bash
sudo certbot --nginx -d epunyasewa.com -d www.epunyasewa.com
```

Selesai! Web aplikasi Anda kini berjalan otomatis di `https://epunyasewa.com` dengan pembaruan otomatis setiap kali ada kode baru di-push ke GitHub.

---

## 7. Perintah Pemeliharaan & Troubleshooting di VPS

Masuk ke direktori `/var/www/epunyasewa` di VPS untuk menjalankan perintah berikut:

- **Melihat Status Kontainer:**
  ```bash
  docker ps
  ```
- **Melihat Log Aplikasi Secara Real-time:**
  ```bash
  docker compose logs -f epunyasewa-web
  ```
- **Restart Kontainer:**
  ```bash
  docker compose restart
  ```
- **Membersihkan Image & Cache Lama (Menghemat Disk):**
  ```bash
  docker system prune -af
  ```
