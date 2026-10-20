<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\DokumenPelamar;
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
        ]);

        $pelamarId = auth('pelamar')->id();

        // 1. Create Application (Lamaran)
        $lamaran = Lamaran::create([
            'id_pelamar' => $pelamarId,
            'id_lowongan' => $id_lowongan,
            'tanggal_lamaran' => now()->toDateString(),
            'status_lamaran' => 'Screening',
            'skor_kecocokan' => null, // AI matching can be populated later
        ]);

        // 2. Handle Document Upload
        if ($request->hasFile('file_dokumen')) {
            $file = $request->file('file_dokumen');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file securely in local storage (storage/app/private/cv or public)
            $path = $file->storeAs('pelamar/dokumen', $fileName, 'local');

            DokumenPelamar::create([
                'id_lamaran' => $lamaran->id_lamaran,
                'jenis_dokumen' => $request->jenis_dokumen,
                'file_dokumen' => $fileName,
                'path_file' => $path,
                'tanggal_upload' => now()
            ]);
        }

        return redirect()->route('pelamar.dashboard')->with('success', 'Application submitted successfully.');
    }
}
