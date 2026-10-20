<?php

namespace Tests\Feature;

use App\Models\HRD;
use App\Models\Lowongan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobBoardSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_board_search_and_type_filter_work(): void
    {
        $hrd = HRD::create([
            'nama_pengguna' => 'Acme HRD',
            'email' => 'hrd@example.com',
            'kata_sandi' => bcrypt('password123'),
        ]);

        Lowongan::create([
            'id_hrd' => $hrd->id_hrd,
            'posisi' => 'Senior UX Designer',
            'lokasi' => 'Jakarta Selatan',
            'status_lowongan' => 'Aktif',
            'tipe_pekerjaan' => 'Full-Time',
            'departemen' => 'Design',
            'deskripsi' => 'Mendesain produk untuk pengguna.',
            'kualifikasi' => 'Paham UX research.',
            'tanggal_buka' => now()->toDateString(),
            'tanggal_tutup' => now()->addDays(30)->toDateString(),
            'gaji_min' => 10000000,
            'gaji_max' => 18000000,
        ]);

        Lowongan::create([
            'id_hrd' => $hrd->id_hrd,
            'posisi' => 'UI/UX Design Intern',
            'lokasi' => 'Bandung',
            'status_lowongan' => 'Aktif',
            'tipe_pekerjaan' => 'Magang / PKL',
            'departemen' => 'Design',
            'deskripsi' => 'Belajar UX design dan prototyping.',
            'kualifikasi' => 'Mahasiswa aktif.',
            'tanggal_buka' => now()->toDateString(),
            'tanggal_tutup' => now()->addDays(20)->toDateString(),
            'gaji_min' => 2000000,
            'gaji_max' => 4000000,
        ]);

        Lowongan::create([
            'id_hrd' => $hrd->id_hrd,
            'posisi' => 'Product Manager',
            'lokasi' => 'Surabaya',
            'status_lowongan' => 'Nonaktif',
            'tipe_pekerjaan' => 'Full-Time',
            'departemen' => 'Product',
            'deskripsi' => 'Mengelola roadmap produk.',
            'kualifikasi' => 'Paham product lifecycle.',
            'tanggal_buka' => now()->toDateString(),
            'tanggal_tutup' => now()->addDays(40)->toDateString(),
            'gaji_min' => 12000000,
            'gaji_max' => 22000000,
        ]);

        $response = $this->get('/jobs?search=ux&type=Full-Time');

        $response->assertOk();
        $response->assertSee('Senior UX Designer');
        $response->assertDontSee('UI/UX Design Intern');
        $response->assertDontSee('Product Manager');
    }
}
