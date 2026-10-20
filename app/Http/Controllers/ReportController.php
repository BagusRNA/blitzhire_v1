<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Fetch all applicants with their application status.
     */
    public function laporanPelamar()
    {
        $data = Lamaran::with(['pelamar', 'lowongan'])
            ->orderBy('tanggal_lamaran', 'desc')
            ->get();

        return Inertia::render('HRD/Laporan/Pelamar', [
            'laporan' => $data
        ]);
    }

    /**
     * Fetch all scheduled/completed interviews with candidate details.
     */
    public function laporanWawancara()
    {
        $data = Lamaran::with(['pelamar', 'lowongan', 'wawancara'])
            ->whereHas('wawancara')
            ->get();

        return Inertia::render('HRD/Laporan/Wawancara', [
            'laporan' => $data
        ]);
    }

    /**
     * Fetch only applicants whose status_lamaran is 'Diterima' or offer accepted.
     */
    public function laporanDiterima()
    {
        $data = Lamaran::with(['pelamar', 'lowongan', 'penawaran'])
            ->where('status_lamaran', 'Diterima')
            ->orWhereHas('penawaran', function($query) {
                $query->where('status_penawaran', 'Diterima');
            })
            ->get();

        return Inertia::render('HRD/Laporan/Diterima', [
            'laporan' => $data
        ]);
    }
}
