<?php

use App\Http\Controllers\HRDController;
use App\Http\Controllers\HRDCandidateController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\PelamarController;
use App\Http\Controllers\ApplicationController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

// Public Landing Page & Job Board
Route::get('/', function () {
    $stats = [
        'jobs' => \App\Models\Lowongan::where('status_lowongan', 'Aktif')->count(),
        'hired' => \App\Models\Lamaran::where('status_lamaran', 'Diterima')->count(),
        'fulltime' => \App\Models\Lowongan::where('status_lowongan', 'Aktif')->where('tipe_pekerjaan', 'Full-Time')->count(),
        'internship' => \App\Models\Lowongan::where('status_lowongan', 'Aktif')->whereIn('tipe_pekerjaan', ['Magang', 'PKL', 'Magang / PKL', 'Internship'])->count(),
    ];
    $recentJobs = \App\Models\Lowongan::where('status_lowongan', 'Aktif')->latest()->take(3)->get();
    
    return Inertia::render('Public/LandingPage', [
        'stats' => $stats,
        'recentJobs' => $recentJobs
    ]);
});
Route::get('/jobs', [JobController::class, 'index'])->name('jobs.index');
Route::get('/jobs/{id_lowongan}', [JobController::class, 'show'])->name('jobs.show');

// Convenience redirects so /login & /register go to Pelamar portal
Route::get('/login', fn() => redirect()->route('pelamar.auth.showLogin'))->name('login');
Route::get('/register', fn() => redirect()->route('pelamar.auth.showRegister'))->name('register');

// HRD Protected Routes
Route::middleware(['auth:hrd'])->prefix('hrd')->name('hrd.')->group(function () {
    Route::get('/dashboard', [HRDController::class, 'dashboard'])->name('dashboard');
    // Phase 1 Dashboard Pages
    Route::get('/manajemen-kandidat', [HRDController::class, 'manajemenKandidat'])->name('manajemen-kandidat');
    Route::get('/manajemen-data', [HRDController::class, 'manajemenData'])->name('manajemen-data');
    Route::delete('/manajemen-data/{id_lamaran}', [HRDController::class, 'destroyLamaran'])->name('manajemen-data.destroy');

    // Kelola Job & Lowongan
    Route::get('/kelola-job', [JobController::class, 'kelolaJob'])->name('kelola-job');
    Route::get('/lowongan', fn() => redirect()->route('hrd.kelola-job'));
    Route::resource('lowongan', JobController::class)->except(['index', 'show']);

    // Konfigurasi Penilaian
    Route::get('/konfigurasi-penilaian', [HRDController::class, 'konfigurasiPenilaian'])->name('konfigurasi-penilaian');

    // Candidate Management (per-job)
    Route::get('/lowongan/{id_lowongan}/kandidat', [HRDCandidateController::class, 'index'])->name('kandidat.index');
    Route::post('/kandidat/{id_lamaran}/status', [HRDCandidateController::class, 'updateStatus'])->name('kandidat.update_status');
    Route::post('/kandidat/{id_lamaran}/schedule', [HRDCandidateController::class, 'scheduleInterview'])->name('kandidat.schedule');
    Route::post('/kandidat/{id_lamaran}/offer', [HRDCandidateController::class, 'sendOffer'])->name('kandidat.offer');

    // Phase 2: Detail Kandidat & Wawancara
    Route::get('/kandidat/{id_lamaran}/detail', [\App\Http\Controllers\LamaranDetailController::class, 'detail'])->name('kandidat.detail');
    Route::get('/kandidat/{id_lamaran}/jadwal-wawancara', [\App\Http\Controllers\LamaranDetailController::class, 'jadwalWawancara'])->name('kandidat.jadwal_wawancara');
    Route::post('/kandidat/{id_lamaran}/jadwalkan', [\App\Http\Controllers\LamaranDetailController::class, 'jadwalkan'])->name('kandidat.jadwalkan');
    Route::post('/kandidat/{id_lamaran}/lanjut-tanpa-wawancara', [\App\Http\Controllers\LamaranDetailController::class, 'lanjutTanpaWawancara'])->name('kandidat.lanjut_tanpa_wawancara');
    Route::get('/kandidat/{id_lamaran}/jadwal-ulang', [\App\Http\Controllers\LamaranDetailController::class, 'jadwalUlang'])->name('kandidat.jadwal_ulang');
    Route::post('/kandidat/{id_lamaran}/reschedule', [\App\Http\Controllers\LamaranDetailController::class, 'reschedule'])->name('kandidat.reschedule');
    Route::get('/kandidat/{id_lamaran}/status-wawancara', [\App\Http\Controllers\LamaranDetailController::class, 'statusWawancara'])->name('kandidat.status_wawancara');
    Route::get('/kandidat/{id_lamaran}/pengajuan', [\App\Http\Controllers\LamaranDetailController::class, 'pengajuan'])->name('kandidat.pengajuan');
    Route::get('/kandidat/{id_lamaran}/hasil-wawancara', [\App\Http\Controllers\LamaranDetailController::class, 'hasilWawancara'])->name('kandidat.hasil_wawancara');
    Route::post('/kandidat/{id_lamaran}/lanjut-penawaran', [\App\Http\Controllers\LamaranDetailController::class, 'lanjutPenawaran'])->name('kandidat.lanjut_penawaran');
    Route::get('/kandidat/{id_lamaran}/penawaran', [\App\Http\Controllers\LamaranDetailController::class, 'penawaran'])->name('kandidat.penawaran');
    Route::post('/kandidat/{id_lamaran}/terima', [\App\Http\Controllers\LamaranDetailController::class, 'terima'])->name('kandidat.terima');
    Route::post('/kandidat/{id_lamaran}/tolak', [\App\Http\Controllers\LamaranDetailController::class, 'tolak'])->name('kandidat.tolak');

    // Reports
    Route::get('/laporan/pelamar', [\App\Http\Controllers\ReportController::class, 'laporanPelamar'])->name('laporan.pelamar');
    Route::get('/laporan/wawancara', [\App\Http\Controllers\ReportController::class, 'laporanWawancara'])->name('laporan.wawancara');
    Route::get('/laporan/diterima', [\App\Http\Controllers\ReportController::class, 'laporanDiterima'])->name('laporan.diterima');
});

// Pelamar Protected Routes
Route::middleware(['auth:pelamar'])->prefix('pelamar')->name('pelamar.')->group(function () {
    Route::get('/dashboard', [PelamarController::class, 'dashboard'])->name('dashboard');
    Route::post('/jobs/{id_lowongan}/apply', [ApplicationController::class, 'store'])->name('jobs.apply');
    
    // Offer Actions
    Route::post('/offers/{id_penawaran}/accept', [PelamarController::class, 'acceptOffer'])->name('offers.accept');
    Route::post('/offers/{id_penawaran}/reject', [PelamarController::class, 'rejectOffer'])->name('offers.reject');

    // Interview Actions
    Route::post('/interviews/{id_wawancara}/accept', [PelamarController::class, 'acceptInterview'])->name('interviews.accept');
    Route::post('/interviews/{id_wawancara}/reschedule', [PelamarController::class, 'requestReschedule'])->name('interviews.reschedule');

    // Document Actions
    Route::post('/applications/{id_lamaran}/documents', [PelamarController::class, 'uploadDocument'])->name('documents.store');
    Route::get('/applications/{id_lamaran}/surat-keputusan', [PelamarController::class, 'downloadSuratKeputusan'])->name('applications.download_sk');
});

require __DIR__.'/auth.php';
