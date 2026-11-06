<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use App\Models\Lowongan;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;

class QATestCasesFase2Test extends TestCase
{
    use DatabaseMigrations;

    protected $hrd;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrd = HRD::create([
            'email' => 'adminhrd@gmail.com',
            'nama_pengguna' => 'adminhrd',
            'kata_sandi' => Hash::make('hrd12345'),
        ]);
    }

    /** TC30: Halaman Kelola Job dapat diakses */
    public function test_tc30_kelola_job_page_renders()
    {
        $response = $this->actingAs($this->hrd, 'hrd')->get('/hrd/kelola-job');
        $response->assertStatus(200);
    }

    /** TC32: HRD memposting job lengkap */
    public function test_tc32_posting_job_lengkap()
    {
        $response = $this->actingAs($this->hrd, 'hrd')->post('/hrd/lowongan', [
            'posisi'          => 'UI/UX Designer',
            'departemen'      => 'Product & Design',
            'lokasi'          => 'Bandung, Jawa Barat',
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min'        => 5000000,
            'gaji_max'        => 8000000,
            'tanggal_buka'    => '2026-08-21',
            'tanggal_tutup'   => '2026-09-21',
            'deskripsi'       => 'Deskripsi lengkap lowongan UI/UX Designer.',
            'kualifikasi'     => 'Kualifikasi desain.',
        ]);

        $response->assertRedirect('/hrd/kelola-job');
        $response->assertSessionHas('success', 'Lowongan berhasil di posting!');
        $this->assertDatabaseHas('lowongan', ['posisi' => 'UI/UX Designer', 'status_lowongan' => 'Aktif']);
    }

    /** TC33 & TC35: HRD posting job dengan kolom wajib kosong saat publish */
    public function test_tc33_tc35_posting_job_kosong_ditolak()
    {
        $response = $this->actingAs($this->hrd, 'hrd')->post('/hrd/lowongan', [
            'posisi'          => 'UI/UX Designer',
            'departemen'      => 'Product & Design',
            'lokasi'          => '', // kosong
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'deskripsi'       => '', // kosong
        ]);

        $response->assertSessionHasErrors(['lokasi', 'deskripsi']);
    }

    /** TC36 & TC37 (IR1 & IR2): HRD menyimpan postingan job sebagai draft (meski ada kolom kosong) */
    public function test_tc36_tc37_simpan_draft_berhasil()
    {
        $response = $this->actingAs($this->hrd, 'hrd')->post('/hrd/lowongan', [
            'posisi'          => 'UI/UX Designer Draft',
            'departemen'      => 'Product & Design',
            'lokasi'          => '', // kosong untuk draft
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Draft',
            'gaji_min'        => 5000000,
            'gaji_max'        => 8000000,
            'deskripsi'       => '', // kosong untuk draft
        ]);

        $response->assertRedirect('/hrd/kelola-job');
        $response->assertSessionHas('success', 'Berhasil tersimpan sebagai draft!');
        $this->assertDatabaseHas('lowongan', [
            'posisi' => 'UI/UX Designer Draft',
            'status_lowongan' => 'Draft',
        ]);
    }

    /** TC40: HRD mengedit lowongan */
    public function test_tc40_edit_lowongan_berhasil()
    {
        $job = Lowongan::create([
            'id_hrd'          => $this->hrd->id_hrd,
            'posisi'          => 'Junior Developer',
            'departemen'      => 'IT',
            'lokasi'          => 'Bandung',
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min'        => 5000000,
            'gaji_max'        => 7000000,
            'tanggal_buka'    => '2026-08-21',
            'tanggal_tutup'   => '2026-09-21',
            'deskripsi'       => 'Deskripsi developer.',
            'kualifikasi'     => 'Kualifikasi developer.',
        ]);

        $response = $this->actingAs($this->hrd, 'hrd')->put("/hrd/lowongan/{$job->id_lowongan}", [
            'posisi'          => 'Senior Developer',
            'departemen'      => 'IT',
            'lokasi'          => 'Bandung',
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min'        => 8000000,
            'gaji_max'        => 12000000,
            'deskripsi'       => 'Deskripsi updated.',
        ]);

        $response->assertRedirect('/hrd/kelola-job');
        $response->assertSessionHas('success', 'Perubahan berhasil disimpan!');
        $this->assertDatabaseHas('lowongan', ['posisi' => 'Senior Developer']);
    }

    /** TC41: HRD menghapus lowongan */
    public function test_tc41_hapus_lowongan_berhasil()
    {
        $job = Lowongan::create([
            'id_hrd'          => $this->hrd->id_hrd,
            'posisi'          => 'Temp Job',
            'departemen'      => 'HR',
            'lokasi'          => 'Jakarta',
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min'        => 5000000,
            'gaji_max'        => 8000000,
            'tanggal_buka'    => '2026-08-21',
            'tanggal_tutup'   => '2026-09-21',
            'deskripsi'       => 'Deskripsi temp.',
            'kualifikasi'     => 'Kualifikasi temp.',
        ]);

        $response = $this->actingAs($this->hrd, 'hrd')->delete("/hrd/lowongan/{$job->id_lowongan}");
        $response->assertRedirect('/hrd/kelola-job');
        $response->assertSessionHas('success', 'Berhasil dihapus!');
        $this->assertDatabaseMissing('lowongan', ['id_lowongan' => $job->id_lowongan]);
    }

    /** TC43 & IR3: Detail lowongan publik */
    public function test_tc43_detail_lowongan_bisa_dibuka()
    {
        $job = Lowongan::create([
            'id_hrd'          => $this->hrd->id_hrd,
            'posisi'          => 'UI/UX Designer',
            'departemen'      => 'Product',
            'lokasi'          => 'Bandung',
            'tipe_pekerjaan'  => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min'        => 5000000,
            'gaji_max'        => 8000000,
            'tanggal_buka'    => '2026-08-21',
            'tanggal_tutup'   => '2026-09-21',
            'deskripsi'       => 'Deskripsi UI/UX.',
            'kualifikasi'     => 'Kualifikasi UI/UX.',
        ]);

        $response = $this->get("/jobs/{$job->id_lowongan}");
        $response->assertStatus(200);
    }

    /** IR26: Filter tipe lowongan hanya membatasi tipe standar */
    public function test_ir26_filter_tipe_lowongan_terbatas()
    {
        $response = $this->get('/jobs');
        $response->assertStatus(200);
        $filterOptions = $response->viewData('page')['props']['filterOptions'] ?? [];
        $this->assertEquals(['Full-Time', 'Internship/PKL'], $filterOptions);
    }
}
