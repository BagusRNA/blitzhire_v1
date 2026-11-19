<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\JadwalWawancara;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;

class HRDController extends Controller
{
    public function dashboard()
    {
        // Lowongan stats
        $lowonganQuery = Lowongan::where('status_lowongan', 'Aktif');
        $lowongan_aktif      = (clone $lowonganQuery)->count();
        $lowongan_fulltime   = (clone $lowonganQuery)->where('tipe_pekerjaan', 'Full-Time')->count();
        $lowongan_magang     = (clone $lowonganQuery)->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL'])->count();

        // Pelamar stats
        $baseQuery = Lamaran::query();
        $total_pelamar = (clone $baseQuery)->count();
        $pelamar_baru_bulan_ini = (clone $baseQuery)
            ->whereMonth('tanggal_lamaran', now()->month)
            ->whereYear('tanggal_lamaran', now()->year)
            ->count();

        // Wawancara hari ini
        $today = Carbon::today();
        $wawancara_hari_ini = JadwalWawancara::whereDate('tanggal_wawancara', $today)
            ->count();

        $jadwal_terdekat = JadwalWawancara::whereDate('tanggal_wawancara', $today)
            ->orderBy('tanggal_wawancara')
            ->first();

        $wawancara_terdekat = $jadwal_terdekat
            ? Carbon::parse($jadwal_terdekat->tanggal_wawancara)->format('H:i')
            : null;

        // Recent applications
        $recentApplications = Lamaran::with(['pelamar', 'lowongan'])
            ->orderBy('tanggal_lamaran', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('HRD/Dashboard', [
            'stats' => compact(
                'lowongan_aktif',
                'lowongan_fulltime',
                'lowongan_magang',
                'total_pelamar',
                'pelamar_baru_bulan_ini',
                'wawancara_hari_ini',
                'wawancara_terdekat'
            ),
            'recentApplications' => $recentApplications,
        ]);
    }

    public function manajemenKandidat()
    {
        $lamaran = Lamaran::with(['pelamar', 'lowongan', 'dokumen', 'wawancara', 'penawaran'])
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        // Cari lamaran yang pelamarnya telah mengonfirmasi/menerima jadwal wawancara (HRD 9)
        $confirmedInterviews = $lamaran->filter(function ($item) {
            $latest = $item->wawancara->last();
            return $latest && (
                $latest->status_wawancara === 'Terkonfirmasi' ||
                str_contains($latest->catatan ?? '', '[Pelamar]: Telah mengonfirmasi')
            );
        })->values();

        return Inertia::render('HRD/ManajemenKandidat', [
            'lamaran' => $lamaran,
            'confirmedInterviews' => $confirmedInterviews,
        ]);
    }

    public function manajemenData()
    {
        $pelamar = Lamaran::with(['pelamar', 'dokumen', 'lowongan'])
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        return Inertia::render('HRD/ManajemenData', [
            'pelamar' => $pelamar,
        ]);
    }

    public function destroyLamaran($id_lamaran)
    {
        $lamaran = Lamaran::with('dokumen')->findOrFail($id_lamaran);

        // Hapus file fisik dokumen jika ada
        foreach ($lamaran->dokumen as $dok) {
            if ($dok->path_file && \Illuminate\Support\Facades\Storage::disk('local')->exists($dok->path_file)) {
                \Illuminate\Support\Facades\Storage::disk('local')->delete($dok->path_file);
            }
        }

        $lamaran->delete();

        return back()->with('success', 'Data pelamar berhasil dihapus.');
    }

    public function konfigurasiPenilaian()
    {
        $thresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '60%'],
            ['label' => 'Skor Auto-Reject', 'key' => 'auto_reject', 'value' => '40%'],
            ['label' => 'Skor Minimum tanpa Screening', 'key' => 'auto_pass', 'value' => '85%'],
        ];

        $categories = [
            ['name' => 'Pendidikan', 'weight' => '20%', 'chips' => ['S1', 'S2', 'Teknik', 'Informatika']],
            ['name' => 'Pengalaman Kerja', 'weight' => '35%', 'chips' => ['3 tahun pengalaman', 'Internship', 'Full-Stack', 'UI/UX']],
            ['name' => 'Technical Skills', 'weight' => '30%', 'chips' => ['Figma', 'React', 'Laravel', 'PHP', 'Tailwind', 'SQL']],
            ['name' => 'Soft Skills', 'weight' => '15%', 'chips' => ['Komunikasi', 'Teamwork', 'Problem Solving', 'Leadership']],
        ];

        return Inertia::render('HRD/KonfigurasiPenilaian', [
            'thresholds' => $thresholds,
            'categories' => $categories,
        ]);
    }

    public function saveKonfigurasiPenilaian(\Illuminate\Http\Request $request)
    {
        // 1. Validasi Batas Skor Otomatis
        $thresholds = $request->input('thresholds', []);
        foreach ($thresholds as $t) {
            $val = trim(str_replace('%', '', $t['value'] ?? ''));
            if ($val === '') {
                return back()->withErrors(['thresholds' => 'Tidak boleh kosong!']);
            }
            if (!is_numeric($val) || $val < 0 || $val > 100) {
                return back()->withErrors(['thresholds' => 'Nilai tidak valid!']);
            }
        }

        // 2. Validasi Kategori & Bobot
        $categories = $request->input('categories', []);
        $totalBobot = 0;
        foreach ($categories as $cat) {
            $w = trim(str_replace('%', '', $cat['weight'] ?? ''));
            if ($w === '') {
                return back()->withErrors(['categories' => 'Tidak boleh kosong!']);
            }
            if (!is_numeric($w) || $w < 0 || $w > 100) {
                return back()->withErrors(['categories' => 'Konfigurasi tidak valid!']);
            }
            $totalBobot += (float) $w;

            // Validasi kata kunci duplikat
            $chips = $cat['chips'] ?? [];
            $lowerChips = array_map('strtolower', $chips);
            if (count($lowerChips) !== count(array_unique($lowerChips))) {
                return back()->withErrors(['categories' => 'Kategori sudah ada!']);
            }
        }

        if (round($totalBobot) !== 100.0) {
            return back()->withErrors(['categories' => 'Konfigurasi tidak valid!']);
        }

        return back()->with('success', 'Konfigurasi penilaian berhasil disimpan.');
    }

    /**
     * Tampilkan halaman Profile Admin / HRD (HRD 13)
     */
    public function profile()
    {
        $hrd = auth('hrd')->user();

        return Inertia::render('HRD/Profile', [
            'hrd' => $hrd,
        ]);
    }

    /**
     * Update data Profile Admin / HRD
     */
    public function updateProfile(Request $request)
    {
        $hrd = auth('hrd')->user();

        $request->validate([
            'nama_pengguna' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:hrd,email,' . $hrd->id_hrd . ',id_hrd',
        ], [
            'nama_pengguna.required' => 'Nama pengguna harus diisi.',
            'email.required' => 'Email harus diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh akun lain.',
        ]);

        $data = [
            'nama_pengguna' => $request->nama_pengguna,
            'email' => $request->email,
        ];

        if ($request->filled('kata_sandi')) {
            $request->validate([
                'kata_sandi' => 'min:6|confirmed',
            ], [
                'kata_sandi.min' => 'Password minimal 6 karakter.',
                'kata_sandi.confirmed' => 'Konfirmasi password tidak cocok.',
            ]);
            $data['kata_sandi'] = Hash::make($request->kata_sandi);
        }

        $hrd->update($data);

        return back()->with('success', 'Profil Admin/HRD berhasil diperbarui.');
    }
}

