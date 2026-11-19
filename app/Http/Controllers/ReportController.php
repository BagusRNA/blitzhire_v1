<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Fetch all applicants with their application status (with filter support HRD 11).
     */
    public function laporanPelamar(Request $request)
    {
        $type = $request->input('type', $request->input('tipe'));
        $status = $request->input('status');

        $query = Lamaran::with(['pelamar', 'lowongan', 'dokumen'])
            ->orderBy('tanggal_lamaran', 'desc');

        if ($type && $type !== 'Semua') {
            if (in_array(strtolower($type), ['magang', 'pkl', 'magang / pkl', 'internship', 'internship/pkl'])) {
                $query->whereHas('lowongan', function($q) {
                    $q->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL', 'Internship', 'Internship/PKL'])
                      ->orWhere('tipe_pekerjaan', 'like', '%Magang%')
                      ->orWhere('tipe_pekerjaan', 'like', '%PKL%');
                });
            } else {
                $query->whereHas('lowongan', function($q) use ($type) {
                    $q->where('tipe_pekerjaan', $type);
                });
            }
        }

        if ($status && $status !== 'Semua') {
            if ($status === 'Penawaran') {
                $query->whereIn('status_lamaran', ['Penawaran', 'Offer']);
            } elseif ($status === 'Wawancara') {
                $query->whereIn('status_lamaran', ['Wawancara', 'Interview']);
            } else {
                $query->where('status_lamaran', $status);
            }
        }

        $data = $query->get();

        return Inertia::render('HRD/Laporan/Pelamar', [
            'laporan' => $data,
            'filters' => [
                'type' => $type ?? 'Semua',
                'status' => $status ?? 'Semua',
            ]
        ]);
    }

    /**
     * Fetch all scheduled/completed interviews with candidate details (with filter support HRD 11).
     */
    public function laporanWawancara(Request $request)
    {
        $type = $request->input('type', $request->input('tipe'));
        $status = $request->input('status');

        $query = Lamaran::with(['pelamar', 'lowongan', 'wawancara'])
            ->whereHas('wawancara');

        if ($type && $type !== 'Semua') {
            if (in_array(strtolower($type), ['magang', 'pkl', 'magang / pkl', 'internship', 'internship/pkl'])) {
                $query->whereHas('lowongan', function($q) {
                    $q->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL', 'Internship', 'Internship/PKL'])
                      ->orWhere('tipe_pekerjaan', 'like', '%Magang%')
                      ->orWhere('tipe_pekerjaan', 'like', '%PKL%');
                });
            } else {
                $query->whereHas('lowongan', function($q) use ($type) {
                    $q->where('tipe_pekerjaan', $type);
                });
            }
        }

        if ($status && $status !== 'Semua') {
            $query->where('status_lamaran', $status);
        }

        $data = $query->get();

        return Inertia::render('HRD/Laporan/Wawancara', [
            'laporan' => $data,
            'filters' => [
                'type' => $type ?? 'Semua',
                'status' => $status ?? 'Semua',
            ]
        ]);
    }

    /**
     * Fetch only applicants whose status_lamaran is 'Diterima' or offer accepted (with filter support HRD 11).
     */
    public function laporanDiterima(Request $request)
    {
        $type = $request->input('type', $request->input('tipe'));

        $query = Lamaran::with(['pelamar', 'lowongan', 'penawaran'])
            ->where(function($q) {
                $q->where('status_lamaran', 'Diterima')
                  ->orWhereHas('penawaran', function($query) {
                      $query->where('status_penawaran', 'Diterima');
                  });
            });

        if ($type && $type !== 'Semua') {
            if (in_array(strtolower($type), ['magang', 'pkl', 'magang / pkl', 'internship', 'internship/pkl'])) {
                $query->whereHas('lowongan', function($q) {
                    $q->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL', 'Internship', 'Internship/PKL'])
                      ->orWhere('tipe_pekerjaan', 'like', '%Magang%')
                      ->orWhere('tipe_pekerjaan', 'like', '%PKL%');
                });
            } else {
                $query->whereHas('lowongan', function($q) use ($type) {
                    $q->where('tipe_pekerjaan', $type);
                });
            }
        }

        $data = $query->get();

        return Inertia::render('HRD/Laporan/Diterima', [
            'laporan' => $data,
            'filters' => [
                'type' => $type ?? 'Semua',
            ]
        ]);
    }
}
