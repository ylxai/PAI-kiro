# PAI-Kiro: Personal AI Infrastructure for Kiro CLI 🚀

**Integrasi Personal AI Infrastructure (PAI) milik Daniel Miessler untuk lingkungan Kiro CLI.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/ylxai/PAI-kiro)
[![Platform](https://img.shields.io/badge/platform-Kiro%20CLI-green.svg)](https://kiro.dev)

> Membawa kekuatan PAI's Life Operating System ke dalam terminal Anda menggunakan Kiro CLI dan runtime Bun.

---

## 🎯 Apa itu PAI-Kiro?

**PAI-Kiro** adalah lapisan adaptasi yang memungkinkan [Personal AI Infrastructure (PAI)](https://github.com/danielmiessler/Personal_AI_Infrastructure) untuk berjalan secara mulus di **Kiro CLI**. Proyek ini memetakan seluruh kapabilitas utama PAI ke dalam fitur bawaan Kiro CLI seperti custom agents, shell hooks, memory, dan skills.

### Fitur Utama

* **✅ 45+ Skills** - Pustaka kemampuan AI yang terspesialisasi (Research, Council, RedTeam, dll.) langsung siap pakai.
* **✅ Hook System** - Alur kerja otomatis berbasis event (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, dan `Stop`).
* **✅ Memory System** - Penyimpanan pengetahuan dan riwayat yang persisten antar sesi percakapan.
* **✅ Algorithm v6.3.0** - Pendekatan pemecahan masalah sistematis melalui 7-phase loop (`OBSERVE` → `THINK` → `PLAN` → `BUILD` → `EXECUTE` → `VERIFY` → `LEARN`).
* **✅ TELOS** - Penyelarasan penuh tindakan AI dengan misi, tujuan hidup, dan nilai-nilai Anda.
* **✅ Custom Agents** - Agen kustom `pai` yang dikonfigurasi secara otomatis untuk Kiro CLI.

---

## 🚀 Quick Start (Kiro CLI)

### Prasyarat

Sebelum menginstal, pastikan sistem Anda memiliki:
1. **[Kiro CLI](https://kiro.dev/cli)** terpasang (`kiro-cli --version`)
2. **[Bun](https://bun.sh)** runtime terpasang (`bun --version` >= v1.0.0)
3. **Git** terpasang

### Instalasi Satu Perintah

Jalankan perintah berikut di direktori root proyek untuk menginstal PAI-Kiro:

```bash
# Berikan izin eksekusi jika diperlukan
chmod +x install.sh

# Jalankan skrip instalasi
./install.sh
```

Skrip `install.sh` akan:
1. Memverifikasi ketersediaan Bun, Kiro CLI, dan Git.
2. Mengunduh dependensi untuk `pai-core` dan `kiro-adapter` menggunakan Bun.
3. Membuat direktori konfigurasi global Kiro (`~/.kiro/`).
4. Mengonfigurasi agen kustom `pai` (`~/.kiro/agents/pai.json`).
5. Memasang skrip hook shell otomatis (`~/.kiro/hooks/`).

---

## 💬 Cara Penggunaan

Setelah instalasi berhasil, Anda dapat langsung mulai berinteraksi dengan agen PAI Anda:

```bash
# Jalankan sesi chat Kiro CLI menggunakan agen PAI
kiro-cli chat --agent pai
```

### 🎯 Memulai Setup & Wawancara (TELOS)

Kiro CLI membatasi penamaan slash command internal secara tetap (*fixed*). Untuk mengatasinya, PAI-Kiro secara otomatis mendaftarkan **Global Prompts** yang bertindak sebagai pintasan. 

Di dalam sesi chat Kiro CLI, ketik perintah berikut untuk memicu alur kerja:
* **`@interview`** — Memulai dialog wawancara Socratic 4 fase (TELOS, IDEAL_STATE, Preferensi, Identitas) untuk mengonfigurasi profil personal Anda secara otomatis.
* **`@telos`** — Memulai peninjauan langsung atas seluruh berkas target TELOS Anda.

*(Tip: Gunakan tombol `Tab` pada terminal Anda untuk melengkapi pintasan `@interview` dan `@telos` secara otomatis!)*

Anda juga dapat menggunakan frasa percakapan biasa seperti `"start the interview"` atau `"review telos"`.

### 🔊 Mengaktifkan PULSE Daemon (Port 31337)

PULSE daemon adalah layanan background yang memberikan notifikasi suara selama alur wawancara berlangsung. Layanan ini otomatis aktif di port `31337` setelah instalasi.

Anda dapat mengontrol status layanan PULSE secara manual menggunakan skrip manajemen:
```bash
# Memulai layanan
~/.kiro/pai/PULSE/manage.sh start

# Memeriksa status
~/.kiro/pai/PULSE/manage.sh status

# Menghentikan layanan
~/.kiro/pai/PULSE/manage.sh stop
```

### Konfigurasi Penting

* **Agent Config**: `~/.kiro/agents/pai.json`
* **Skills Directory**: `~/.kiro/skills/`
* **Hooks Directory**: `~/.kiro/hooks/`
* **Memory Directory**: `~/.kiro/pai/MEMORY/`

---

## 📦 Struktur Proyek

```
PAI-kiro/
├── Releases/v5.0.0/          # PAI original core (Claude Code)
│   └── .claude/              # System PAI
│
├── pai-core/                 # Core logic platform-agnostic PAI
│
├── kiro-adapter/             # Lapisan adaptasi untuk Kiro CLI
│   ├── src/
│   │   ├── adapters/
│   │   │   └── KiroAdapter.ts       # Adapter utama Kiro CLI
│   │   ├── core/
│   │   │   └── PAICore.ts           # Loader PAI Core
│   │   └── cli/
│   │       └── install-cli.ts       # Wizard Installer (TypeScript)
│   └── package.json
│
├── install.sh                # Skrip instalasi bootstrap global
├── KIRO_CLI_GUIDE.md        # Panduan penggunaan lengkap Kiro CLI
└── README.md                # Dokumentasi ini
```

---

## 🤝 Kontribusi

Kontribusi sangat kami harapkan! Silakan baca [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan berkontribusi.

### Pengembangan Lokal

```bash
# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependensi
bun install

# Jalankan dalam mode watch
bun run dev

# Jalankan test suite
bun test
```

---

**Dibuat dengan ❤️ oleh komunitas PAI-Kiro**
