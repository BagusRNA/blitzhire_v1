<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\JadwalWawancara;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LamaranDetailController extends Controller
{
    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function getLamaran($id_lamaran)
    {
        $lamaran = Lamaran::with([
            'pelamar.sosialMedia',
            'lowongan',
            'dokumen',
            'wawancara',
            'penawaran',
        ])
        ->findOrFail($id_lamaran);

        // Jika dokumen pada lamaran ini kosong, cari dokumen terbaru dari pelamar (HRD 6)
        if ($lamaran->dokumen->isEmpty() && $lamaran->pelamar) {
            $fallbackDocs = \App\Models\DokumenPelamar::whereHas('lamaran', function ($q) use ($lamaran) {
                $q->where('id_pelamar', $lamaran->id_pelamar);
            })->latest('id_dokumen')->get();

            if ($fallbackDocs->isNotEmpty()) {
                $lamaran->setRelation('dokumen', $fallbackDocs);
            }
        }

        return $lamaran;
    }

    // ─── 1. Detail Pelamar ───────────────────────────────────────────────────

    public function detail($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);

        return Inertia::render('HRD/Kandidat/DetailPelamar', [
            'lamaran' => $lamaran,
        ]);
    }

    // ─── 2. Jadwal Wawancara (buat baru dari Screening) ─────────────────────

    public function jadwalWawancara($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);

        return Inertia::render('HRD/Kandidat/JadwalWawancara', [
            'lamaran' => $lamaran,
        ]);
    }

    /** POST: Jadwalkan wawancara baru */
    public function jadwalkan(Request $request, $id_lamaran)
    {
        $request->validate([
            'tanggal_wawancara' => 'required|date',
            'link_meeting'      => 'nullable|string|max:225',
            'lokasi'            => 'nullable|string|max:150',
            'format_wawancara'  => 'required|in:Online,Offline',
            'interviewer'       => 'nullable|string|max:100',
        ]);

        $lamaran = $this->getLamaran($id_lamaran);

        JadwalWawancara::create([
            'id_lamaran'        => $id_lamaran,
            'tanggal_wawancara' => $request->tanggal_wawancara,
            'lokasi'            => $request->lokasi ?? '-',
            'interviewer'       => $request->interviewer ?? auth('hrd')->user()->email,
            'status_wawancara'  => 'Terjadwal',
            'format_wawancara'  => $request->format_wawancara,
            'link_meeting'      => $request->link_meeting,
        ]);

        $lamaran->update(['status_lamaran' => 'Wawancara']);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Jadwal wawancara berhasil dibuat.');
    }

    /** POST: Lanjut tanpa wawancara (skip ke Penawaran) */
    public function lanjutTanpaWawancara($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $lamaran->update(['status_lamaran' => 'Penawaran']);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Kandidat dilanjutkan tanpa wawancara.');
    }

    // ─── 3. Jadwal Ulang ────────────────────────────────────────────────────

    public function jadwalUlang($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $jadwalTerakhir = $lamaran->wawancara->last();

        $pengajuanPelamar = null;
        $usulanPelamar = null;
        $rescheduleCount = 0;

        foreach ($lamaran->wawancara as $w) {
            if (preg_match_all('/\[Pengajuan Jadwal Ulang Pelamar(?:\s*#(\d+))?\]/i', $w->catatan ?? '', $matches)) {
                foreach ($matches[1] as $num) {
                    if ($num !== '') {
                        $rescheduleCount = max($rescheduleCount, (int)$num);
                    } else {
                        $rescheduleCount++;
                    }
                }
            }
        }

        if ($jadwalTerakhir && str_contains($jadwalTerakhir->catatan ?? '', '[Pengajuan Jadwal Ulang Pelamar')) {
            // Ambil bagian [Pengajuan Jadwal Ulang Pelamar...]
            if (preg_match('/\[Pengajuan Jadwal Ulang Pelamar[^\]]*\]:[^\n]*/i', $jadwalTerakhir->catatan, $m)) {
                $pengajuanPelamar = $m[0];
            } else {
                $pengajuanPelamar = $jadwalTerakhir->catatan;
            }

            // Ekstrak usulan tanggal dan waktu
            preg_match('/Tanggal Baru:\s*([^|]+)/i', $pengajuanPelamar, $matchTgl);
            preg_match('/Waktu:\s*([^|\n]+)/i', $pengajuanPelamar, $matchWkt);
            $usulanPelamar = [
                'tanggal' => isset($matchTgl[1]) ? trim($matchTgl[1]) : null,
                'waktu'   => isset($matchWkt[1]) ? trim($matchWkt[1]) : null,
            ];
        }

        return Inertia::render('HRD/Kandidat/JadwalUlang', [
            'lamaran'          => $lamaran,
            'jadwalTerakhir'   => $jadwalTerakhir,
            'pengajuanPelamar' => $pengajuanPelamar,
            'usulanPelamar'    => $usulanPelamar,
            'rescheduleCount'  => $rescheduleCount,
        ]);
    }

    /** POST: Simpan jadwal ulang (Setujui / Atur Jadwal Baru) */
    public function reschedule(Request $request, $id_lamaran)
    {
        $request->validate([
            'tanggal_wawancara' => 'required',
            'link_meeting'      => 'nullable|string|max:225',
            'format_wawancara'  => 'nullable|in:Online,Offline',
            'alasan_hrd'        => 'nullable|string|max:500',
        ]);

        $lamaran = $this->getLamaran($id_lamaran);

        // Tandai jadwal lama sebagai dibatalkan
        $lamaran->wawancara()->whereIn('status_wawancara', ['Terjadwal', 'Ditunda'])
            ->update(['status_wawancara' => 'Dibatalkan']);

        $catatan = 'Pengajuan jadwal ulang disetujui HRD.';
        if ($request->alasan_hrd) {
            $catatan .= ' Catatan: ' . $request->alasan_hrd;
        }

        JadwalWawancara::create([
            'id_lamaran'        => $id_lamaran,
            'tanggal_wawancara' => $request->tanggal_wawancara,
            'lokasi'            => $request->lokasi ?? '-',
            'interviewer'       => $request->interviewer ?? auth('hrd')->user()->email,
            'status_wawancara'  => 'Terjadwal',
            'format_wawancara'  => $request->format_wawancara ?? 'Online',
            'link_meeting'      => $request->link_meeting,
            'catatan'           => $catatan,
        ]);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Jadwal wawancara berhasil disetujui dan diperbarui.');
    }

    /** POST: Tolak pengajuan jadwal ulang dari pelamar */
    public function rejectReschedule(Request $request, $id_lamaran)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string|max:500',
        ], [
            'alasan_penolakan.required' => 'Mohon cantumkan alasan penolakan jadwal ulang.',
        ]);

        $lamaran = $this->getLamaran($id_lamaran);
        $wawancara = $lamaran->wawancara->where('status_wawancara', 'Ditunda')->last()
            ?? $lamaran->wawancara->last();

        if ($wawancara) {
            $catatanLama = $wawancara->catatan ? trim($wawancara->catatan) . "\n" : '';
            $catatanBaru = $catatanLama . "[Pengajuan Jadwal Ulang Ditolak HRD]: Alasan: " . $request->alasan_penolakan;

            $wawancara->update([
                'status_wawancara' => 'Terjadwal',
                'catatan'          => $catatanBaru,
            ]);
        }

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Pengajuan jadwal ulang pelamar berhasil ditolak.');
    }

    // ─── 4. Pengecekan Status Wawancara ──────────────────────────────────────

    public function statusWawancara($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $jadwalTerakhir = $lamaran->wawancara->last();

        $pengajuanPelamar = null;
        if ($jadwalTerakhir && str_contains($jadwalTerakhir->catatan ?? '', '[Pengajuan Jadwal Ulang Pelamar]')) {
            $pengajuanPelamar = $jadwalTerakhir->catatan;
        }

        return Inertia::render('HRD/Kandidat/StatusWawancara', [
            'lamaran'          => $lamaran,
            'jadwalTerakhir'   => $jadwalTerakhir,
            'pengajuanPelamar' => $pengajuanPelamar,
        ]);
    }

    // ─── 5. Pengajuan Pelamar (review setelah interview) ────────────────────

    public function pengajuan($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $jadwalTerakhir = $lamaran->wawancara->last();

        return Inertia::render('HRD/Kandidat/PengajuanPelamar', [
            'lamaran'        => $lamaran,
            'jadwalTerakhir' => $jadwalTerakhir,
        ]);
    }

    // ─── 5. Hasil Wawancara (note review) ───────────────────────────────────

    public function hasilWawancara($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $jadwalTerakhir = $lamaran->wawancara->last();

        return Inertia::render('HRD/Kandidat/HasilWawancara', [
            'lamaran'        => $lamaran,
            'jadwalTerakhir' => $jadwalTerakhir,
        ]);
    }

    // ─── 6. Penawaran ────────────────────────────────────────────────────────

    public function penawaran($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);

        return Inertia::render('HRD/Kandidat/Penawaran', [
            'lamaran' => $lamaran,
        ]);
    }

    public function lanjutPenawaran(Request $request, $id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        
        // Simpan catatan wawancara jika ada (dari HasilWawancara)
        if ($request->filled('catatan')) {
            $jadwal = $lamaran->wawancara->last();
            if ($jadwal) {
                $jadwal->update(['catatan' => $request->catatan]);
            }
        }

        $lamaran->update(['status_lamaran' => 'Penawaran']);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Kandidat dilanjutkan ke tahap Penawaran.');
    }

    // ─── Actions: Terima / Tolak ─────────────────────────────────────────────

    public function terima($id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        $lamaran->update(['status_lamaran' => 'Diterima']);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Kandidat diterima (Hired).');
    }

    public function tolak(Request $request, $id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);
        
        // Simpan catatan wawancara jika ada (dari HasilWawancara)
        if ($request->filled('catatan')) {
            $jadwal = $lamaran->wawancara->last();
            if ($jadwal) {
                $jadwal->update(['catatan' => $request->catatan]);
            }
        }

        $lamaran->update(['status_lamaran' => 'Ditolak']);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Kandidat ditolak.');
    }

    /**
     * Kembalikan / Revert status pelamar yang terlanjur diterima/ditolak (HRD 7)
     */
    public function revertStatus(Request $request, $id_lamaran)
    {
        $lamaran = $this->getLamaran($id_lamaran);

        $targetStatus = $request->input('target_status', 'Screening');
        if (!in_array($targetStatus, ['Screening', 'Wawancara', 'Penawaran', 'Pending'])) {
            $targetStatus = 'Screening';
        }

        $lamaran->update(['status_lamaran' => $targetStatus]);

        return redirect()->back()
            ->with('success', "Status kandidat berhasil dikembalikan ke {$targetStatus}.");
    }

    /**
     * Lihat berkas CV kandidat secara inline di tab browser (HRD 6)
     */
    public function viewDokumen($id_dokumen)
    {
        $dok = \App\Models\DokumenPelamar::findOrFail($id_dokumen);
        
        $candidates = [
            storage_path('app/public/' . $dok->path_file),
            storage_path('app/' . $dok->path_file),
            storage_path('app/private/' . $dok->path_file),
            public_path('storage/' . $dok->path_file),
        ];

        foreach ($candidates as $filePath) {
            if (file_exists($filePath) && is_file($filePath)) {
                return response()->file($filePath, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="' . $dok->file_dokumen . '"',
                ]);
            }
        }

        // Placeholder PDF valid jika file belum diunggah secara fisik pada environment dev/seeder
        return response(
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF",
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $dok->file_dokumen . '"',
            ]
        );
    }

    /**
     * Unduh berkas CV kandidat (HRD 6)
     */
    public function downloadDokumen($id_dokumen)
    {
        $dok = \App\Models\DokumenPelamar::findOrFail($id_dokumen);
        
        $candidates = [
            storage_path('app/public/' . $dok->path_file),
            storage_path('app/' . $dok->path_file),
            storage_path('app/private/' . $dok->path_file),
            public_path('storage/' . $dok->path_file),
        ];

        foreach ($candidates as $filePath) {
            if (file_exists($filePath) && is_file($filePath)) {
                return response()->download($filePath, $dok->file_dokumen);
            }
        }

        return response(
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF",
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $dok->file_dokumen . '"',
            ]
        );
    }
}
