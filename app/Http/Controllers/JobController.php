<?php

namespace App\Http\Controllers;

use App\Models\Lowongan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $type = trim((string) $request->input('type', ''));

        $query = Lowongan::query()
            ->where('status_lowongan', 'Aktif');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $term = "%{$search}%";

                $q->where('posisi', 'like', $term)
                    ->orWhere('departemen', 'like', $term)
                    ->orWhere('lokasi', 'like', $term)
                    ->orWhere('deskripsi', 'like', $term)
                    ->orWhere('kualifikasi', 'like', $term);
            });
        }

        if ($type !== '' && $type !== 'Semua') {
            if (in_array(strtolower($type), ['internship/pkl', 'magang / pkl', 'magang', 'pkl', 'internship', 'internship / pkl'])) {
                $query->where(function ($q) {
                    $q->whereIn('tipe_pekerjaan', ['Internship/PKL', 'Magang / PKL', 'Magang', 'PKL', 'Internship'])
                      ->orWhere('tipe_pekerjaan', 'like', '%Magang%')
                      ->orWhere('tipe_pekerjaan', 'like', '%PKL%')
                      ->orWhere('tipe_pekerjaan', 'like', '%Intern%');
                });
            } else {
                $query->where('tipe_pekerjaan', $type);
            }
        }

        $jobs = $query->orderBy('created_at', 'desc')->get();

        $defaultTypes = ['Full-Time', 'Internship/PKL'];
        $dbTypes = Lowongan::query()
            ->where('status_lowongan', 'Aktif')
            ->select('tipe_pekerjaan')
            ->distinct()
            ->pluck('tipe_pekerjaan')
            ->filter()
            ->values()
            ->all();

        $otherTypes = [];
        foreach ($dbTypes as $item) {
            if ($item !== 'Full-Time' && !in_array(strtolower($item), ['magang', 'pkl', 'magang / pkl', 'internship', 'internship/pkl'])) {
                $otherTypes[] = $item;
            }
        }

        $filterOptions = array_values(array_unique(array_merge($defaultTypes, $otherTypes)));

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs,
            'filterOptions' => $filterOptions,
            'filters' => [
                'search' => $search,
                'type' => $type !== '' ? $type : 'Semua',
            ],
        ]);
    }

    public function show($id_lowongan)
    {
        $job = Lowongan::findOrFail($id_lowongan);

        return Inertia::render('Jobs/Show', [
            'job' => $job
        ]);
    }

    public function kelolaJob(Request $request)
    {
        $hrdId = auth('hrd')->id();
        $search = trim((string) $request->input('keyword', $request->input('search', '')));
        $status = trim((string) $request->input('status', 'Semua'));
        $type = trim((string) $request->input('type', 'Semua'));

        $query = Lowongan::query();
        if ($hrdId) {
            $query->where('id_hrd', $hrdId);
        }

        if ($search !== '') {
            $term = "%{$search}%";
            $query->where(function ($q) use ($term) {
                $q->where('posisi', 'like', $term)
                  ->orWhere('departemen', 'like', $term)
                  ->orWhere('lokasi', 'like', $term);
            });
        }

        if ($status !== '' && $status !== 'Semua') {
            $query->where('status_lowongan', $status);
        }

        if ($type !== '' && $type !== 'Semua') {
            if (in_array(strtolower($type), ['internship', 'internship/pkl', 'magang', 'pkl'])) {
                $query->where(function ($q) {
                    $q->whereIn('tipe_pekerjaan', ['Internship/PKL', 'Magang / PKL', 'Magang', 'PKL', 'Internship'])
                      ->orWhere('tipe_pekerjaan', 'like', '%Intern%')
                      ->orWhere('tipe_pekerjaan', 'like', '%PKL%');
                });
            } else {
                $query->where('tipe_pekerjaan', $type);
            }
        }

        $jobs = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('HRD/KelolaJob', [
            'jobs' => $jobs,
            'filters' => [
                'keyword' => $search,
                'status' => $status,
                'type' => $type,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('HRD/EditLowongan', [
            'lowongan' => null,
            'isEdit' => false,
        ]);
    }

    public function store(Request $request)
    {
        $hrdId = auth('hrd')->id() ?? \App\Models\HRD::first()?->id_hrd ?? 1;

        $validated = $request->validate([
            'posisi' => 'required|string|max:100',
            'departemen' => 'required|string|max:100',
            'lokasi' => 'required|string|max:100',
            'tipe_pekerjaan' => 'required|string|max:50',
            'status_lowongan' => 'required|string|in:Aktif,Draft,Tutup',
            'gaji_min' => 'nullable|numeric|min:0',
            'gaji_max' => 'nullable|numeric|min:0',
            'tanggal_buka' => 'nullable|date',
            'tanggal_tutup' => 'nullable|date',
            'deskripsi' => 'required|string',
            'kualifikasi' => 'nullable|string',
        ]);

        $validated['id_hrd'] = $hrdId;
        $validated['gaji_min'] = $validated['gaji_min'] ?? 0;
        $validated['gaji_max'] = $validated['gaji_max'] ?? 0;
        $validated['kualifikasi'] = $validated['kualifikasi'] ?? '-';
        $validated['tanggal_buka'] = $validated['tanggal_buka'] ?? now()->toDateString();
        $validated['tanggal_tutup'] = $validated['tanggal_tutup'] ?? now()->addDays(30)->toDateString();

        $job = Lowongan::create($validated);

        // Optional default ATS configuration
        try {
            \App\Models\Konfigurasi::firstOrCreate(
                ['id_lowongan' => $job->id_lowongan],
                [
                    'id_konfigurasi' => (string) \Illuminate\Support\Str::uuid(),
                    'Skor_lolos_otomatis' => 80,
                    'Skor_min' => 60,
                    'Skor_gagal_otomatis' => 40,
                ]
            );
        } catch (\Throwable $e) {
            // Ignore if already exists or table structure variation
        }

        return redirect()->route('hrd.kelola-job')->with('success', 'Lowongan berhasil diterbitkan.');
    }

    public function edit($id_lowongan)
    {
        $hrdId = auth('hrd')->id();
        $query = Lowongan::where('id_lowongan', $id_lowongan);
        if ($hrdId) {
            $query->where('id_hrd', $hrdId);
        }
        $lowongan = $query->firstOrFail();

        return Inertia::render('HRD/EditLowongan', [
            'lowongan' => $lowongan,
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, $id_lowongan)
    {
        $hrdId = auth('hrd')->id();
        $query = Lowongan::where('id_lowongan', $id_lowongan);
        if ($hrdId) {
            $query->where('id_hrd', $hrdId);
        }
        $lowongan = $query->firstOrFail();

        $validated = $request->validate([
            'posisi' => 'required|string|max:100',
            'departemen' => 'required|string|max:100',
            'lokasi' => 'required|string|max:100',
            'tipe_pekerjaan' => 'required|string|max:50',
            'status_lowongan' => 'required|string|in:Aktif,Draft,Tutup',
            'gaji_min' => 'nullable|numeric|min:0',
            'gaji_max' => 'nullable|numeric|min:0',
            'tanggal_buka' => 'nullable|date',
            'tanggal_tutup' => 'nullable|date',
            'deskripsi' => 'required|string',
            'kualifikasi' => 'nullable|string',
        ]);

        $validated['gaji_min'] = $validated['gaji_min'] ?? 0;
        $validated['gaji_max'] = $validated['gaji_max'] ?? 0;
        $validated['kualifikasi'] = $validated['kualifikasi'] ?? $lowongan->kualifikasi ?? '-';

        $lowongan->update($validated);

        return redirect()->route('hrd.kelola-job')->with('success', 'Lowongan berhasil diperbarui.');
    }

    public function destroy($id_lowongan)
    {
        $hrdId = auth('hrd')->id();
        $query = Lowongan::where('id_lowongan', $id_lowongan);
        if ($hrdId) {
            $query->where('id_hrd', $hrdId);
        }
        $lowongan = $query->firstOrFail();
        $lowongan->delete();

        return redirect()->route('hrd.kelola-job')->with('success', 'Lowongan berhasil dihapus.');
    }
}
