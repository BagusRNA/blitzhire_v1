<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\DokumenPelamar;
use App\Services\ScoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    /**
     * Store candidate's application and handle document upload.
     */
    public function store(Request $request, $id_lowongan)
    {
        $request->validate([
            'file_dokumen' => 'required|file|mimes:pdf|max:5120', // max 5MB
            'jenis_dokumen' => 'required|string|max:100'
        ], [
            'file_dokumen.mimes' => 'Format file tidak tepat! Harap unggah berkas berformat PDF.',
            'file_dokumen.required' => 'CV wajib diunggah.',
        ]);

        $pelamarId = auth('pelamar')->id();

        // Cek jika pelamar sudah pernah melamar lowongan ini dan lamarannya masih aktif / sedang diproses oleh HRD (HRD 10)
        $existingLamaran = Lamaran::where('id_pelamar', $pelamarId)
            ->where('id_lowongan', $id_lowongan)
            ->whereNotIn('status_lamaran', ['Ditolak'])
            ->first();

        if ($existingLamaran) {
            return back()->withErrors([
                'duplicate' => 'Anda sudah melamar ke lowongan ini dan lamaran sedang diproses oleh HRD.'
            ])->with('error', 'Anda sudah melamar ke lowongan ini dan lamaran sedang diproses oleh HRD.');
        }

        // 1. Create Application (Lamaran)
        $lamaran = Lamaran::create([
            'id_pelamar' => $pelamarId,
            'id_lowongan' => $id_lowongan,
            'tanggal_lamaran' => now()->toDateString(),
            'status_lamaran' => 'Screening',
            'skor_kecocokan' => 0.0,
        ]);

        // 2. Handle Document Upload & Scoring (HRD 18 & Pelamar 9)
        if ($request->hasFile('file_dokumen')) {
            $file = $request->file('file_dokumen');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file securely
            $path = $file->storeAs('pelamar/dokumen', $fileName, 'local');

            DokumenPelamar::create([
                'id_lamaran' => $lamaran->id_lamaran,
                'jenis_dokumen' => $request->jenis_dokumen,
                'file_dokumen' => $fileName,
                'path_file' => $path,
                'tanggal_upload' => now()
            ]);

            // Hitung skor kecocokan CV terhadap lowongan (ScoringService)
            $scoringService = new ScoringService();
            $fullFilePath = storage_path('app/' . $path);
            if (!file_exists($fullFilePath)) {
                $fullFilePath = $file->getRealPath();
            }
            $extractedText = $scoringService->extractTextFromPdf($fullFilePath);
            $scoringService->calculateScore($lamaran, $extractedText);
        }

        return redirect()->route('pelamar.dashboard')->with('success', 'Application submitted successfully.');
    }
}
