<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\Penawaran;
use App\Models\JadwalWawancara;
use App\Models\DokumenPelamar;
use Illuminate\Http\Request;
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

        return back()->with('success', 'Selamat! Anda telah menerima penawaran kerja ini.');
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

        return back()->with('success', 'Anda telah menolak penawaran kerja.');
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

        return back()->with('success', 'Undangan wawancara berhasil dikonfirmasi. Harap hadir tepat waktu!');
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

        $alasanText = $request->alasan ? " | Alasan: " . $request->alasan : "";
        $catatanReschedule = "[Pengajuan Jadwal Ulang Pelamar]: Tanggal Baru: " . $request->tanggal_baru . " | Waktu: " . $request->waktu_baru . $alasanText;

        // Clean previous reschedule notes if re-submitting
        $cleanedCatatan = preg_replace('/\[Pengajuan Jadwal Ulang Pelamar\]:.*$/s', '', $wawancara->catatan ?? '');
        $cleanedCatatan = trim($cleanedCatatan);
        $newCatatan = $cleanedCatatan ? $cleanedCatatan . "\n" . $catatanReschedule : $catatanReschedule;

        $wawancara->update([
            'status_wawancara' => 'Ditunda',
            'catatan'          => $newCatatan
        ]);

        return back()->with('success', 'Permintaan perubahan jadwal wawancara berhasil diajukan ke tim HRD.');
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
}
