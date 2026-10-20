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

    /** Pastikan lamaran milik HRD yang sedang login */
    private function getLamaran($id_lamaran)
    {
        return Lamaran::with([
            'pelamar.sosialMedia',
            'lowongan',
            'dokumen',
            'wawancara',
            'penawaran',
        ])
        ->whereHas('lowongan', fn($q) => $q->where('id_hrd', auth('hrd')->id()))
        ->findOrFail($id_lamaran);
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
        if ($jadwalTerakhir && str_contains($jadwalTerakhir->catatan ?? '', '[Pengajuan Jadwal Ulang Pelamar]')) {
            $pengajuanPelamar = $jadwalTerakhir->catatan;
        }

        return Inertia::render('HRD/Kandidat/JadwalUlang', [
            'lamaran'          => $lamaran,
            'jadwalTerakhir'   => $jadwalTerakhir,
            'pengajuanPelamar' => $pengajuanPelamar,
        ]);
    }

    /** POST: Simpan jadwal ulang */
    public function reschedule(Request $request, $id_lamaran)
    {
        $request->validate([
            'tanggal_wawancara' => 'required',
            'link_meeting'      => 'nullable|string|max:225',
            'format_wawancara'  => 'nullable|in:Online,Offline',
        ]);

        $lamaran = $this->getLamaran($id_lamaran);

        // Tandai jadwal lama sebagai dibatalkan
        $lamaran->wawancara()->whereIn('status_wawancara', ['Terjadwal', 'Ditunda'])
            ->update(['status_wawancara' => 'Dibatalkan']);

        JadwalWawancara::create([
            'id_lamaran'        => $id_lamaran,
            'tanggal_wawancara' => $request->tanggal_wawancara,
            'lokasi'            => $request->lokasi ?? '-',
            'interviewer'       => $request->interviewer ?? auth('hrd')->user()->email,
            'status_wawancara'  => 'Terjadwal',
            'format_wawancara'  => $request->format_wawancara ?? 'Online',
            'link_meeting'      => $request->link_meeting,
            'catatan'           => 'Jadwal wawancara telah disesuaikan oleh HRD.',
        ]);

        return redirect()->route('hrd.manajemen-kandidat')
            ->with('success', 'Jadwal wawancara berhasil diperbarui.');
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
}
