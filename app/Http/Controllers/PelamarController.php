<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\Penawaran;
use App\Models\JadwalWawancara;
use App\Models\DokumenPelamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PelamarController extends Controller
{
    /**
     * Display the applicant dashboard with timeline, interviews, and offers.
     */
    public function dashboard()
    {
        $pelamarId = auth('pelamar')->id();
        
        // Fetch applicant's applications with related jobs, interviews, offers, and documents
        $lamarans = Lamaran::with(['pelamar', 'lowongan', 'wawancara', 'penawaran', 'dokumen'])
            ->where('id_pelamar', $pelamarId)
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        return Inertia::render('Pelamar/Dashboard', [
            'lamarans' => $lamarans,
            'lamaran' => $lamarans,
        ]);
    }

    /**
     * Accept Job Offer
     */
    public function acceptOffer(Request $request, $id_penawaran)
    {
        $penawaran = Penawaran::findOrFail($id_penawaran);
        
        // Update Offer Status
        $penawaran->update(['status_penawaran' => 'Diterima']);

        // Update overall Application Status
        $lamaran = Lamaran::findOrFail($penawaran->id_lamaran);
        $lamaran->update(['status_lamaran' => 'Diterima']);

        return back()->with('success', 'Penawaran diterima!');
    }

    /**
     * Reject Job Offer
     */
    public function rejectOffer(Request $request, $id_penawaran)
    {
        $penawaran = Penawaran::findOrFail($id_penawaran);
        
        // Update Offer Status
        $penawaran->update(['status_penawaran' => 'Ditolak']);

        // Update overall Application Status
        $lamaran = Lamaran::findOrFail($penawaran->id_lamaran);
        $lamaran->update(['status_lamaran' => 'Ditolak']);

        return back()->with('success', 'Negoisasi telah terkirim!');
    }

    /**
     * Confirm Attendance for Interview
     */
    public function acceptInterview(Request $request, $id_wawancara)
    {
        $wawancara = JadwalWawancara::whereHas('lamaran', function($q) {
            $q->where('id_pelamar', auth('pelamar')->id());
        })->findOrFail($id_wawancara);

        $catatanExisting = $wawancara->catatan ? $wawancara->catatan . "\n" : '';
        $wawancara->update([
            'catatan' => $catatanExisting . '[Pelamar]: Telah mengonfirmasi kehadiran wawancara.'
        ]);

        return back()->with('success', 'Jadwal wawancara berhasil dikonfirmasi.');
    }

    /**
     * Request Interview Reschedule
     */
    public function requestReschedule(Request $request, $id_wawancara)
    {
        $request->validate([
            'tanggal_baru' => 'required',
            'waktu_baru'   => 'required|string|max:100',
            'alasan'       => 'nullable|string|max:500'
        ]);

        $wawancara = JadwalWawancara::whereHas('lamaran', function($q) {
            $q->where('id_pelamar', auth('pelamar')->id());
        })->findOrFail($id_wawancara);

        // IR22: Kunci agar pelamar tidak bisa mengajukan berulang kali sebelum HRD merespon
        if ($wawancara->status_wawancara === 'Ditunda') {
            return back()->withErrors(['reschedule' => 'Pengajuan jadwal ulang Anda sedang diproses oleh HRD. Anda tidak dapat mengajukan lagi sampai HRD memberikan respon jadwal baru.']);
        }

        // Batasi pengajuan jadwal ulang maksimal 3 kali per lamaran
        $rescheduleCount = 0;
        $allWawancara = JadwalWawancara::where('id_lamaran', $wawancara->id_lamaran)->get();
        foreach ($allWawancara as $w) {
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

        if ($rescheduleCount >= 3) {
            return back()->withErrors(['reschedule' => 'Batas maksimal pengajuan jadwal ulang telah tercapai (maksimal 3 kali). Anda tidak dapat mengajukan perubahan jadwal lagi.']);
        }

        $nextCount = $rescheduleCount + 1;
        $alasanText = $request->alasan ? " | Alasan: " . $request->alasan : "";
        $catatanReschedule = "[Pengajuan Jadwal Ulang Pelamar #{$nextCount}]: Tanggal Baru: " . $request->tanggal_baru . " | Waktu: " . $request->waktu_baru . $alasanText;

        // Clean previous pending markers if any
        $cleanedCatatan = preg_replace('/\[Pengajuan Jadwal Ulang Pelamar(?:\s*#\d+)?\]:.*$/s', '', $wawancara->catatan ?? '');
        $cleanedCatatan = trim($cleanedCatatan);
        $newCatatan = $cleanedCatatan ? $cleanedCatatan . "\n" . $catatanReschedule : $catatanReschedule;

        $wawancara->update([
            'status_wawancara' => 'Ditunda',
            'catatan'          => $newCatatan
        ]);

        return back()->with('success', 'Pengajuan berhasil diajukan!');
    }

    /**
     * Upload Additional Document
     */
    public function uploadDocument(Request $request, $id_lamaran)
    {
        $request->validate([
            'file_dokumen' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'jenis_dokumen' => 'required|string|max:100'
        ]);

        $lamaran = Lamaran::where('id_pelamar', auth('pelamar')->id())->findOrFail($id_lamaran);

        $file = $request->file('file_dokumen');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('pelamar/dokumen', $fileName, 'local');

        DokumenPelamar::create([
            'id_lamaran' => $lamaran->id_lamaran,
            'jenis_dokumen' => $request->jenis_dokumen,
            'file_dokumen' => $fileName,
            'path_file' => $path,
            'tanggal_upload' => now()
        ]);

        return back()->with('success', 'Dokumen tambahan berhasil diunggah.');
    }

    /**
     * Download or view official Surat Keputusan (SK) Penerimaan
     */
    public function downloadSuratKeputusan($id_lamaran)
    {
        $pelamarId = auth('pelamar')->id();
        $lamaran = Lamaran::with(['pelamar', 'lowongan', 'penawaran', 'dokumen'])
            ->where('id_pelamar', $pelamarId)
            ->findOrFail($id_lamaran);

        // Check if an uploaded SK file exists in DokumenPelamar
        $skDoc = $lamaran->dokumen->first(function($doc) {
            $jenis = strtolower($doc->jenis_dokumen);
            return str_contains($jenis, 'keputusan') || str_contains($jenis, 'sk') || str_contains($jenis, 'surat');
        });

        if ($skDoc && \Illuminate\Support\Facades\Storage::disk('local')->exists($skDoc->path_file)) {
            return \Illuminate\Support\Facades\Storage::disk('local')->download($skDoc->path_file, $skDoc->file_dokumen);
        }

        // Return printable official document view
        return view('documents.surat_keputusan', compact('lamaran'));
    }

    /**
     * Tampilkan halaman Profile Pelamar (Pelamar 2)
     */
    public function profile()
    {
        $pelamar = auth('pelamar')->user();

        return Inertia::render('Pelamar/Profile', [
            'pelamar' => $pelamar,
        ]);
    }

    /**
     * Update data Profile Pelamar
     */
    public function updateProfile(Request $request)
    {
        $pelamar = auth('pelamar')->user();

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:pelamar,email,' . $pelamar->id_pelamar . ',id_pelamar',
            'nomor_hp' => 'required|string|max:20',
            'pendidikan_terakhir' => 'required|string|max:100',
            'alamat' => 'required|string',
        ], [
            'nama_lengkap.required' => 'Nama lengkap harus diisi.',
            'email.required' => 'Email harus diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar pada akun lain.',
            'nomor_hp.required' => 'Nomor HP harus diisi.',
            'pendidikan_terakhir.required' => 'Pendidikan terakhir harus diisi.',
            'alamat.required' => 'Alamat harus diisi.',
        ]);

        $data = [
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'nomor_hp' => $request->nomor_hp,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'alamat' => $request->alamat,
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

        $pelamar->update($data);

        return back()->with('success', 'Profil pelamar berhasil diperbarui.');
    }
}
