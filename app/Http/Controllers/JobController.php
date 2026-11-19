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

        $filterOptions = ['Full-Time', 'Internship/PKL'];

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

        $pelamarId = auth('pelamar')->id();
        $hasActiveApplication = false;
        if ($pelamarId) {
            $hasActiveApplication = \App\Models\Lamaran::where('id_pelamar', $pelamarId)
                ->where('id_lowongan', $id_lowongan)
                ->whereNotIn('status_lamaran', ['Ditolak'])
                ->exists();
        }

        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'hasActiveApplication' => $hasActiveApplication,
        ]);
    }

    public function kelolaJob(Request $request)
    {
        $search = trim((string) $request->input('keyword', $request->input('search', '')));
        $status = trim((string) $request->input('status', 'Semua'));
        $type = trim((string) $request->input('type', 'Semua'));

        $query = Lowongan::query();

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

        $isDraft = ($request->input('status_lowongan') === 'Draft');

        $rules = [
            'posisi' => 'required|string|max:100',
            'departemen' => $isDraft ? 'nullable|string|max:100' : 'required|string|max:100',
            'lokasi' => $isDraft ? 'nullable|string|max:100' : 'required|string|max:100',
            'tipe_pekerjaan' => 'nullable|string|max:50',
            'status_lowongan' => 'required|string|in:Aktif,Draft,Tutup',
            'gaji_min' => 'nullable|numeric|min:0',
            'gaji_max' => 'nullable|numeric|min:0',
            'tanggal_buka' => 'nullable|date',
            'tanggal_tutup' => 'nullable|date',
            'deskripsi' => $isDraft ? 'nullable|string' : 'required|string',
            'kualifikasi' => 'nullable|string',
        ];

        $validated = $request->validate($rules, [
            'posisi.required' => 'Posisi pekerjaan wajib diisi.',
            'departemen.required' => 'Masih ada kolom kosong!',
            'lokasi.required' => 'Masih ada kolom kosong!',
            'deskripsi.required' => 'Masih ada kolom kosong!',
        ]);

        $validated['id_hrd'] = $hrdId;
        $validated['departemen'] = $validated['departemen'] ?? 'Product & Design';
        $validated['lokasi'] = $validated['lokasi'] ?? '-';
        $validated['tipe_pekerjaan'] = $validated['tipe_pekerjaan'] ?? 'Full-Time';
        $validated['deskripsi'] = $validated['deskripsi'] ?? '-';
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

        $msg = $isDraft ? 'Berhasil tersimpan sebagai draft!' : 'Lowongan berhasil di posting!';
        return redirect()->route('hrd.kelola-job')->with('success', $msg);
    }

    public function edit($id_lowongan)
    {
        $lowongan = Lowongan::where('id_lowongan', $id_lowongan)->firstOrFail();

        return Inertia::render('HRD/EditLowongan', [
            'lowongan' => $lowongan,
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, $id_lowongan)
    {
        $lowongan = Lowongan::where('id_lowongan', $id_lowongan)->firstOrFail();

        $isDraft = ($request->input('status_lowongan') === 'Draft');

        $rules = [
            'posisi' => 'required|string|max:100',
            'departemen' => $isDraft ? 'nullable|string|max:100' : 'required|string|max:100',
            'lokasi' => $isDraft ? 'nullable|string|max:100' : 'required|string|max:100',
            'tipe_pekerjaan' => 'nullable|string|max:50',
            'status_lowongan' => 'required|string|in:Aktif,Draft,Tutup',
            'gaji_min' => 'nullable|numeric|min:0',
            'gaji_max' => 'nullable|numeric|min:0',
            'tanggal_buka' => 'nullable|date',
            'tanggal_tutup' => 'nullable|date',
            'deskripsi' => $isDraft ? 'nullable|string' : 'required|string',
            'kualifikasi' => 'nullable|string',
        ];

        $validated = $request->validate($rules, [
            'posisi.required' => 'Posisi pekerjaan wajib diisi.',
            'departemen.required' => 'Masih ada kolom kosong!',
            'lokasi.required' => 'Masih ada kolom kosong!',
            'deskripsi.required' => 'Masih ada kolom kosong!',
        ]);

        $validated['departemen'] = $validated['departemen'] ?? $lowongan->departemen ?? 'Product & Design';
        $validated['lokasi'] = $validated['lokasi'] ?? $lowongan->lokasi ?? '-';
        $validated['tipe_pekerjaan'] = $validated['tipe_pekerjaan'] ?? $lowongan->tipe_pekerjaan ?? 'Full-Time';
        $validated['deskripsi'] = $validated['deskripsi'] ?? $lowongan->deskripsi ?? '-';
        $validated['gaji_min'] = $validated['gaji_min'] ?? 0;
        $validated['gaji_max'] = $validated['gaji_max'] ?? 0;
        $validated['kualifikasi'] = $validated['kualifikasi'] ?? $lowongan->kualifikasi ?? '-';

        $lowongan->update($validated);

        $msg = $isDraft ? 'Berhasil tersimpan sebagai draft!' : 'Perubahan berhasil disimpan!';
        return redirect()->route('hrd.kelola-job')->with('success', $msg);
    }

    public function destroy($id_lowongan)
    {
        $lowongan = Lowongan::where('id_lowongan', $id_lowongan)->firstOrFail();
        $lowongan->delete();

        return redirect()->route('hrd.kelola-job')->with('success', 'Berhasil dihapus!');
    }
}
