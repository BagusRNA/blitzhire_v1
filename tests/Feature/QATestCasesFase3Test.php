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

class QATestCasesFase3Test extends TestCase
{
    use DatabaseMigrations;

    protected $hrd;
    protected $pelamar;
    protected $lowongan;
    protected $lamaran;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrd = HRD::create([
            'email' => 'adminhrd@blitzhire.test',
            'nama_pengguna' => 'adminhrd',
            'kata_sandi' => Hash::make('hrd12345'),
        ]);

        $this->pelamar = Pelamar::create([
            'nama_lengkap' => 'Budi Santoso',
            'email' => 'budi.santoso@gmail.com',
            'kata_sandi' => Hash::make('pelamar123'),
            'nomor_hp' => '081234567890',
            'alamat' => 'Jl. Diponegoro No. 123, Bandung',
            'pendidikan_terakhir' => 'S1 Teknik Informatika',
        ]);

        $this->lowongan = Lowongan::create([
            'id_hrd' => $this->hrd->id_hrd,
            'posisi' => 'Frontend Engineer',
            'departemen' => 'Engineering',
            'lokasi' => 'Bandung, Jawa Barat',
            'tipe_pekerjaan' => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min' => 7000000,
            'gaji_max' => 10000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'deskripsi' => 'Pengembang aplikasi frontend menggunakan React.',
            'kualifikasi' => 'Menguasai JavaScript dan React.',
        ]);

        $this->lamaran = Lamaran::create([
            'id_pelamar' => $this->pelamar->id_pelamar,
            'id_lowongan' => $this->lowongan->id_lowongan,
            'tanggal_lamaran' => '2026-09-05',
            'status_lamaran' => 'Screening',
            'skor_kecocokan' => 88.5,
        ]);
    }

    /**
     * IR4 / TC46: Detail Pelamar menampilkan alamat, nomor hp, dan data pelamar dengan lengkap
     */
    public function test_tc46_detail_pelamar_displays_applicant_info()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/{$this->lamaran->id_lamaran}/detail");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Kandidat/DetailPelamar')
            ->has('lamaran')
            ->where('lamaran.pelamar.nama_lengkap', 'Budi Santoso')
            ->where('lamaran.pelamar.nomor_hp', '081234567890')
            ->where('lamaran.pelamar.alamat', 'Jl. Diponegoro No. 123, Bandung')
        );
    }

    /**
     * IR5 / TC47: Dokumen CV / Resume terdeteksi dan dimuat pada Detail Pelamar
     */
    public function test_tc47_cv_document_loaded_for_candidate()
    {
        DokumenPelamar::create([
            'id_lamaran' => $this->lamaran->id_lamaran,
            'jenis_dokumen' => 'CV / Resume',
            'file_dokumen' => 'budi_santoso_cv.pdf',
            'path_file' => 'documents/budi_santoso_cv.pdf',
            'tanggal_upload' => now(),
        ]);

        $response = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/{$this->lamaran->id_lamaran}/detail");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Kandidat/DetailPelamar')
            ->has('lamaran.dokumen', 1)
            ->where('lamaran.dokumen.0.file_dokumen', 'budi_santoso_cv.pdf')
        );
    }

    /**
     * IR6 / TC48: Penjadwalan Wawancara oleh HRD
     */
    public function test_tc48_jadwalkan_wawancara_berhasil()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/jadwalkan", [
                'tanggal_wawancara' => '2026-09-10 10:00:00',
                'format_wawancara' => 'Online',
                'lokasi' => 'Google Meet',
                'link_meeting' => 'https://meet.google.com/xyz-abcd-efg',
                'interviewer' => 'Manager HR',
            ]);

        $response->assertRedirect('/hrd/manajemen-kandidat');
        $response->assertSessionHas('success', 'Jadwal wawancara berhasil dibuat.');

        $this->assertDatabaseHas('jadwal_wawancara', [
            'id_lamaran' => $this->lamaran->id_lamaran,
            'status_wawancara' => 'Terjadwal',
            'format_wawancara' => 'Online',
            'interviewer' => 'Manager HR',
        ]);

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $this->lamaran->id_lamaran,
            'status_lamaran' => 'Wawancara',
        ]);
    }

    /**
     * IR6 / TC48: Pelamar mengonfirmasi kehadiran wawancara dan HRD melihat status terkonfirmasi
     */
    public function test_tc48_pelamar_konfirmasi_kehadiran_wawancara()
    {
        $wawancara = JadwalWawancara::create([
            'id_lamaran' => $this->lamaran->id_lamaran,
            'tanggal_wawancara' => '2026-09-10 10:00:00',
            'lokasi' => 'Google Meet',
            'interviewer' => 'Manager HR',
            'status_wawancara' => 'Terjadwal',
            'format_wawancara' => 'Online',
            'link_meeting' => 'https://meet.google.com/xyz-abcd-efg',
            'catatan' => null,
        ]);

        // Pelamar mengonfirmasi kehadiran
        $confirmResponse = $this->actingAs($this->pelamar, 'pelamar')
            ->post("/pelamar/interviews/{$wawancara->id_wawancara}/accept");

        $confirmResponse->assertSessionHas('success');
        $wawancara->refresh();
        $this->assertStringContainsString('[Pelamar]: Telah mengonfirmasi', $wawancara->catatan);

        // HRD melihat halaman status wawancara
        $hrdResponse = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/{$this->lamaran->id_lamaran}/status-wawancara");

        $hrdResponse->assertStatus(200);
        $hrdResponse->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Kandidat/StatusWawancara')
            ->where('jadwalTerakhir.id_wawancara', $wawancara->id_wawancara)
            ->where('jadwalTerakhir.catatan', $wawancara->catatan)
        );

        // HRD melihat pipeline di manajemen kandidat
        $kanbanResponse = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/manajemen-kandidat');

        $kanbanResponse->assertStatus(200);
        $kanbanResponse->assertInertia(fn (Assert $page) => $page
            ->component('HRD/ManajemenKandidat')
            ->has('lamaran')
        );
    }

    /**
     * IR7 / TC50: HRD mengajukan penawaran kerja (Job Offer) berhasil tersimpan
     */
    public function test_tc50_hrd_mengajukan_penawaran_kerja_berhasil()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/offer", [
                'nominal_gaji' => 8500000,
                'posisi_kerja' => 'Frontend Engineer',
                'lokasi_kerja' => 'Bandung',
            ]);

        $response->assertRedirect('/hrd/manajemen-kandidat');
        $response->assertSessionHas('success', 'Penawaran berhasil diajukan!');

        $this->assertDatabaseHas('penawaran', [
            'id_lamaran' => $this->lamaran->id_lamaran,
            'nominal_gaji' => 8500000,
            'posisi_kerja' => 'Frontend Engineer',
            'lokasi_kerja' => 'Bandung',
            'status_penawaran' => 'Menunggu',
        ]);

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $this->lamaran->id_lamaran,
            'status_lamaran' => 'Offer',
        ]);
    }

    /**
     * IR7 / TC50: HRD mengajukan penawaran kerja dengan field wajib kosong ditolak
     */
    public function test_tc50_hrd_penawaran_kerja_validasi_wajib_isi()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/offer", [
                'nominal_gaji' => '',
                'posisi_kerja' => '',
                'lokasi_kerja' => '',
            ]);

        $response->assertSessionHasErrors(['nominal_gaji', 'posisi_kerja', 'lokasi_kerja']);
        $this->assertDatabaseMissing('penawaran', [
            'id_lamaran' => $this->lamaran->id_lamaran,
        ]);
    }
}

