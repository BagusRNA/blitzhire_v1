<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\JadwalWawancara;
use Inertia\Inertia;
use Carbon\Carbon;

class HRDController extends Controller
{
    public function dashboard()
    {
        $hrdId = auth('hrd')->id();

        // Lowongan stats
        $lowonganQuery = Lowongan::where('id_hrd', $hrdId)->where('status_lowongan', 'Aktif');
        $lowongan_aktif      = (clone $lowonganQuery)->count();
        $lowongan_fulltime   = (clone $lowonganQuery)->where('tipe_pekerjaan', 'Full-Time')->count();
        $lowongan_magang     = (clone $lowonganQuery)->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL'])->count();

        // Pelamar stats
        $baseQuery = Lamaran::whereHas('lowongan', fn($q) => $q->where('id_hrd', $hrdId));
        $total_pelamar = (clone $baseQuery)->count();
        $pelamar_baru_bulan_ini = (clone $baseQuery)
            ->whereMonth('tanggal_lamaran', now()->month)
            ->whereYear('tanggal_lamaran', now()->year)
            ->count();

        // Wawancara hari ini
        $today = Carbon::today();
        $wawancara_hari_ini = JadwalWawancara::whereHas('lamaran.lowongan', fn($q) => $q->where('id_hrd', $hrdId))
            ->whereDate('tanggal_wawancara', $today)
            ->count();

        $jadwal_terdekat = JadwalWawancara::whereHas('lamaran.lowongan', fn($q) => $q->where('id_hrd', $hrdId))
            ->whereDate('tanggal_wawancara', $today)
            ->orderBy('tanggal_wawancara')
            ->first();

        $wawancara_terdekat = $jadwal_terdekat
            ? Carbon::parse($jadwal_terdekat->tanggal_wawancara)->format('H:i')
            : null;

        // Recent applications
        $recentApplications = Lamaran::with(['pelamar', 'lowongan'])
            ->whereHas('lowongan', fn($q) => $q->where('id_hrd', $hrdId))
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
        $hrdId = auth('hrd')->id();

        $lamaran = Lamaran::with(['pelamar', 'lowongan', 'dokumen', 'wawancara', 'penawaran'])
            ->whereHas('lowongan', fn($q) => $q->where('id_hrd', $hrdId))
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        return Inertia::render('HRD/ManajemenKandidat', [
            'lamaran' => $lamaran,
        ]);
    }

    public function manajemenData()
    {
        $hrdId = auth('hrd')->id();

        $pelamar = Lamaran::with(['pelamar', 'dokumen'])
            ->whereHas('lowongan', fn($q) => $q->where('id_hrd', $hrdId))
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        return Inertia::render('HRD/ManajemenData', [
            'pelamar' => $pelamar,
        ]);
    }

    public function destroyLamaran($id_lamaran)
    {
        $hrdId = auth('hrd')->id();
        $lamaran = Lamaran::whereHas('lowongan', fn($q) => $q->where('id_hrd', $hrdId))
            ->findOrFail($id_lamaran);
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
}

