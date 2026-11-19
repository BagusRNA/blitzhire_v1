<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use App\Models\Pelamar;
use App\Models\Lowongan;
use App\Models\Lamaran;
use App\Models\DokumenPelamar;
use App\Models\JadwalWawancara;
use App\Models\Penawaran;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

class QATestCasesFase4Test extends TestCase
{
    use DatabaseMigrations;

    protected $hrd;
    protected $pelamar1;
    protected $pelamar2;
    protected $lowonganFullTime;
    protected $lowonganMagang;
    protected $lamaran1;
    protected $lamaran2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrd = HRD::create([
            'email' => 'adminhrd@blitzhire.test',
            'nama_pengguna' => 'adminhrd',
            'kata_sandi' => Hash::make('hrd12345'),
        ]);

        $this->pelamar1 = Pelamar::create([
            'nama_lengkap' => 'Pelamar Satu',
            'email' => 'pelamar1@gmail.com',
            'kata_sandi' => Hash::make('password123'),
            'nomor_hp' => '081111111111',
            'alamat' => 'Bandung',
            'pendidikan_terakhir' => 'S1',
        ]);

        $this->pelamar2 = Pelamar::create([
            'nama_lengkap' => 'Pelamar Dua',
            'email' => 'pelamar2@gmail.com',
            'kata_sandi' => Hash::make('password123'),
            'nomor_hp' => '082222222222',
            'alamat' => 'Jakarta',
            'pendidikan_terakhir' => 'D3',
        ]);

        $this->lowonganFullTime = Lowongan::create([
            'id_hrd' => $this->hrd->id_hrd,
            'posisi' => 'Backend Developer',
            'departemen' => 'Engineering',
            'lokasi' => 'Bandung',
            'tipe_pekerjaan' => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min' => 8000000,
            'gaji_max' => 12000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'deskripsi' => 'Pengembang backend Laravel.',
            'kualifikasi' => 'Menguasai PHP & Laravel.',
        ]);

        $this->lowonganMagang = Lowongan::create([
            'id_hrd' => $this->hrd->id_hrd,
            'posisi' => 'UI Designer Intern',
            'departemen' => 'Design',
            'lokasi' => 'Remote',
            'tipe_pekerjaan' => 'Magang / PKL',
            'status_lowongan' => 'Aktif',
            'gaji_min' => 2000000,
            'gaji_max' => 3000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'deskripsi' => 'Internship UI UX.',
            'kualifikasi' => 'Figma.',
        ]);

        $this->lamaran1 = Lamaran::create([
            'id_pelamar' => $this->pelamar1->id_pelamar,
            'id_lowongan' => $this->lowonganFullTime->id_lowongan,
            'tanggal_lamaran' => '2026-09-02',
            'status_lamaran' => 'Screening',
            'skor_kecocokan' => 85.0,
        ]);

        $this->lamaran2 = Lamaran::create([
            'id_pelamar' => $this->pelamar2->id_pelamar,
            'id_lowongan' => $this->lowonganMagang->id_lowongan,
            'tanggal_lamaran' => '2026-09-03',
            'status_lamaran' => 'Diterima',
            'skor_kecocokan' => 92.0,
        ]);
    }

    /**
     * IR8 / TC53: Halaman Manajemen Data menampilkan satu daftar tabel data pelamar terpadu
     */
    public function test_tc53_manajemen_data_page_renders_with_unified_pelamar_data()
    {
        $response = $this->actingAs($this->hrd, 'hrd')->get('/hrd/manajemen-data');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/ManajemenData')
            ->has('pelamar', 2)
            ->where('pelamar.0.pelamar.nama_lengkap', 'Pelamar Dua')
            ->where('pelamar.0.lowongan.tipe_pekerjaan', 'Magang / PKL')
            ->where('pelamar.1.pelamar.nama_lengkap', 'Pelamar Satu')
            ->where('pelamar.1.lowongan.tipe_pekerjaan', 'Full-Time')
        );
    }

    /**
     * IR10 / TC56: Hapus data pelamar dari Manajemen Data
     */
    public function test_tc56_hapus_data_pelamar_berhasil()
    {
        $idToDelete = $this->lamaran1->id_lamaran;

        $response = $this->actingAs($this->hrd, 'hrd')
            ->delete("/hrd/manajemen-data/{$idToDelete}");

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Data pelamar berhasil dihapus.');

        $this->assertDatabaseMissing('lamaran', [
            'id_lamaran' => $idToDelete,
        ]);
    }

    /**
     * IR12 / TC58: Cetak Laporan Pelamar
     */
    public function test_tc58_cetak_laporan_pelamar_renders()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/laporan/pelamar');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Laporan/Pelamar')
            ->has('laporan', 2)
        );
    }

    /**
     * IR13 / TC59: Cetak Laporan Wawancara
     */
    public function test_tc59_cetak_laporan_wawancara_renders()
    {
        // Buat jadwal wawancara untuk lamaran 1
        JadwalWawancara::create([
            'id_lamaran' => $this->lamaran1->id_lamaran,
            'tanggal_wawancara' => '2026-09-15 14:00:00',
            'lokasi' => 'Google Meet',
            'interviewer' => 'HR Manager',
            'status_wawancara' => 'Terjadwal',
            'format_wawancara' => 'Online',
        ]);

        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/laporan/wawancara');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Laporan/Wawancara')
            ->has('laporan', 1)
            ->where('laporan.0.pelamar.nama_lengkap', 'Pelamar Satu')
        );
    }

    /**
     * IR14 / TC60: Cetak Laporan Pelamar Diterima
     */
    public function test_tc60_cetak_laporan_pelamar_diterima_renders()
    {
        // Lamaran 2 memiliki status 'Diterima'
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/laporan/diterima');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Laporan/Diterima')
            ->has('laporan', 1)
            ->where('laporan.0.pelamar.nama_lengkap', 'Pelamar Dua')
        );
    }

    /**
     * HRD 11: Cetak Laporan dengan filtering tipe dan status berjalan akurat
     */
    public function test_hrd11_cetak_laporan_dengan_filter_tipe_dan_status()
    {
        // Filter Laporan Pelamar dengan status 'Diterima' dan tipe 'Magang / PKL' -> Pelamar Dua
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/laporan/pelamar?status=Diterima&type=Magang / PKL');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Laporan/Pelamar')
            ->has('laporan', 1)
            ->where('laporan.0.pelamar.nama_lengkap', 'Pelamar Dua')
        );

        // Filter status 'Wawancara' (tidak ada di setup) -> 0 data
        $responseEmpty = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/laporan/pelamar?status=Wawancara');

        $responseEmpty->assertStatus(200);
        $responseEmpty->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Laporan/Pelamar')
            ->has('laporan', 0)
        );
    }
}

