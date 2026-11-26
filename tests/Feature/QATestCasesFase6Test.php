<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use App\Models\Pelamar;
use App\Models\Lowongan;
use App\Models\Lamaran;
use App\Models\JadwalWawancara;
use App\Models\Penawaran;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

class QATestCasesFase6Test extends TestCase
{
    use DatabaseMigrations;

    protected $hrd;
    protected $pelamarBaru;
    protected $pelamarAktif;
    protected $lowongan;
    protected $lamaran;
    protected $wawancara;
    protected $penawaran;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrd = HRD::create([
            'email' => 'adminhrd@blitzhire.test',
            'nama_pengguna' => 'adminhrd',
            'kata_sandi' => Hash::make('hrd12345'),
        ]);

        $this->pelamarBaru = Pelamar::create([
            'nama_lengkap' => 'Pelamar Baru',
            'email' => 'pelamarbaru@gmail.com',
            'kata_sandi' => Hash::make('password123'),
            'nomor_hp' => '089999999999',
            'alamat' => 'Jakarta',
            'pendidikan_terakhir' => 'S1',
        ]);

        $this->pelamarAktif = Pelamar::create([
            'nama_lengkap' => 'Pelamar Aktif',
            'email' => 'pelamaraktif@gmail.com',
            'kata_sandi' => Hash::make('password123'),
            'nomor_hp' => '087777777777',
            'alamat' => 'Bandung',
            'pendidikan_terakhir' => 'S1',
        ]);

        $this->lowongan = Lowongan::create([
            'id_hrd' => $this->hrd->id_hrd,
            'posisi' => 'Fullstack Developer',
            'departemen' => 'Engineering',
            'lokasi' => 'Bandung',
            'tipe_pekerjaan' => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min' => 9000000,
            'gaji_max' => 15000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'deskripsi' => 'Fullstack Laravel React.',
            'kualifikasi' => 'Laravel, React, PostgreSQL/MySQL.',
        ]);

        $this->lamaran = Lamaran::create([
            'id_pelamar' => $this->pelamarAktif->id_pelamar,
            'id_lowongan' => $this->lowongan->id_lowongan,
            'tanggal_lamaran' => '2026-09-05',
            'status_lamaran' => 'Wawancara',
            'skor_kecocokan' => 90.0,
        ]);

        $this->wawancara = JadwalWawancara::create([
            'id_lamaran' => $this->lamaran->id_lamaran,
            'tanggal_wawancara' => '2026-09-12 10:00:00',
            'lokasi' => 'Google Meet',
            'interviewer' => 'HR Director',
            'status_wawancara' => 'Terjadwal',
            'format_wawancara' => 'Online',
            'link_meeting' => 'https://meet.google.com/abc-defg-hij',
        ]);

        $this->penawaran = Penawaran::create([
            'id_lamaran' => $this->lamaran->id_lamaran,
            'nominal_gaji' => 10000000,
            'posisi_kerja' => 'Fullstack Developer',
            'lokasi_kerja' => 'Bandung',
            'status_penawaran' => 'Menunggu',
            'tanggal_penawaran' => '2026-09-15',
        ]);
    }

    /**
     * IR21 / TC32: Akun pelamar baru tidak menampilkan data dummy / lamaran orang lain
     */
    public function test_tc32_akun_baru_dashboard_kosong_tanpa_data_dummy()
    {
        $response = $this->actingAs($this->pelamarBaru, 'pelamar')
            ->get('/pelamar/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pelamar/Dashboard')
            ->has('lamarans', 0)
        );
    }

    /**
     * IR22 / TC33: Pelamar mengajukan reschedule wawancara dan pengajuan berulang dikunci
     */
    public function test_tc33_reschedule_wawancara_dan_kunci_pengajuan_ganda()
    {
        // 1. Pengajuan pertama sukses
        $response1 = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-15',
                'waktu_baru'   => '14.00 - 15.00 WIB',
                'alasan'       => 'Ada keperluan mendadak',
            ]);

        $response1->assertRedirect();
        $response1->assertSessionHas('success', 'Pengajuan berhasil diajukan!');

        $this->wawancara->refresh();
        $this->assertEquals('Ditunda', $this->wawancara->status_wawancara);
        $this->assertStringContainsString('Ada keperluan mendadak', $this->wawancara->catatan);

        // 2. Pengajuan kedua sebelum HRD merespon -> dikunci/ditolak
        $response2 = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-16',
                'waktu_baru'   => '10.00 - 11.00 WIB',
            ]);

        $response2->assertSessionHasErrors(['reschedule']);
    }

    /**
     * IR23 / TC34 / Pelamar 10: Pelamar menerima penawaran kerja (status penawaran Diterima, status pelamar tidak otomatis berubah ke Diterima)
     */
    public function test_tc34_pelamar_terima_penawaran_kerja()
    {
        $response = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/offers/{$this->penawaran->id_penawaran}/accept");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->penawaran->refresh();
        $this->lamaran->refresh();
        $this->assertEquals('Diterima', $this->penawaran->status_penawaran);
        // Status lamaran tidak otomatis menjadi 'Diterima', tetap di tahap sebelumnya sampai HRD memutuskan di Status Kandidat
        $this->assertNotEquals('Diterima', $this->lamaran->status_lamaran);
    }

    /**
     * IR24 / TC35: Pelamar menolak penawaran kerja dengan alasan/negosiasi
     */
    public function test_tc35_pelamar_menolak_penawaran_kerja_dengan_alasan()
    {
        $response = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/offers/{$this->penawaran->id_penawaran}/reject", [
                'alasan' => 'Ekspektasi gaji minimal Rp 12.000.000'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Negoisasi telah terkirim!');

        $this->penawaran->refresh();
        $this->lamaran->refresh();
        $this->assertEquals('Ditolak', $this->penawaran->status_penawaran);
        $this->assertEquals('Ditolak', $this->lamaran->status_lamaran);
    }

    /**
     * IR25 / TC41: Menampilkan status wawancara Selesai di Dashboard Pelamar
     */
    public function test_tc41_dashboard_menampilkan_wawancara_selesai()
    {
        $this->wawancara->update(['status_wawancara' => 'Selesai']);

        $response = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->get('/pelamar/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pelamar/Dashboard')
            ->where('lamarans.0.wawancara.0.status_wawancara', 'Selesai')
        );
    }

    /**
     * IR29 / TC52: Validasi upload file CV harus PDF
     */
    public function test_tc52_upload_cv_bukan_pdf_ditolak()
    {
        Storage::fake('local');

        $jpgFile = UploadedFile::fake()->create('cv_pelamar.jpg', 500, 'image/jpeg');

        $response = $this->actingAs($this->pelamarBaru, 'pelamar')
            ->post("/pelamar/jobs/{$this->lowongan->id_lowongan}/apply", [
                'file_dokumen' => $jpgFile,
                'jenis_dokumen' => 'CV / Resume',
            ]);

        $response->assertSessionHasErrors(['file_dokumen']);
        $this->assertDatabaseMissing('dokumen_pelamar', [
            'file_dokumen' => 'cv_pelamar.jpg',
        ]);
    }

    /**
     * IR29 / TC52: Upload file CV berupa PDF diterima
     */
    public function test_tc52_upload_cv_pdf_diterima()
    {
        Storage::fake('local');

        $pdfFile = UploadedFile::fake()->create('cv_pelamar.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->pelamarBaru, 'pelamar')
            ->post("/pelamar/jobs/{$this->lowongan->id_lowongan}/apply", [
                'file_dokumen' => $pdfFile,
                'jenis_dokumen' => 'CV / Resume',
            ]);

        $response->assertRedirect('/pelamar/dashboard');
        $this->assertDatabaseHas('lamaran', [
            'id_pelamar' => $this->pelamarBaru->id_pelamar,
            'id_lowongan' => $this->lowongan->id_lowongan,
        ]);
    }

    /**
     * HRD 10: Pelamar tidak dapat melamar ke lowongan yang sama jika lamaran sedang diproses oleh HRD
     */
    public function test_hrd10_cegah_pelamar_melamar_ganda_pada_lowongan_yang_sama()
    {
        Storage::fake('local');
        $pdfFile = UploadedFile::fake()->create('cv_pelamar.pdf', 500, 'application/pdf');

        // $this->pelamarAktif sudah memiliki lamaran aktif pada $this->lowongan (status: 'Wawancara')
        $response = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/jobs/{$this->lowongan->id_lowongan}/apply", [
                'file_dokumen' => $pdfFile,
                'jenis_dokumen' => 'CV / Resume',
            ]);

        $response->assertSessionHasErrors(['duplicate']);
        // Jumlah lamaran tetap 1 (tidak bertambah ganda)
        $this->assertEquals(1, Lamaran::where('id_pelamar', $this->pelamarAktif->id_pelamar)
            ->where('id_lowongan', $this->lowongan->id_lowongan)->count());
    }

    /**
     * HRD 7: Fitur mengembalikan / revert status pelamar yang terlanjur diterima atau ditolak
     */
    public function test_hrd7_revert_status_kandidat()
    {
        // Ubah lamaran ke Ditolak
        $this->lamaran->update(['status_lamaran' => 'Ditolak']);
        $this->assertEquals('Ditolak', $this->lamaran->fresh()->status_lamaran);

        // HRD revert ke Screening
        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/revert-status", [
                'target_status' => 'Screening'
            ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Screening', $this->lamaran->fresh()->status_lamaran);

        // Revert ke Wawancara
        $response2 = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/revert-status", [
                'target_status' => 'Wawancara'
            ]);

        $response2->assertSessionHas('success');
        $this->assertEquals('Wawancara', $this->lamaran->fresh()->status_lamaran);
    }

    /**
     * HRD 6: View dan download dokumen CV kandidat
     */
    public function test_hrd6_view_dan_download_dokumen_cv()
    {
        $dok = \App\Models\DokumenPelamar::create([
            'id_lamaran' => $this->lamaran->id_lamaran,
            'jenis_dokumen' => 'CV / Resume',
            'file_dokumen' => 'test_cv.pdf',
            'path_file' => 'dummy/test_cv.pdf',
            'tanggal_upload' => now(),
        ]);

        $responseView = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/dokumen/{$dok->id_dokumen}/view");
        $responseView->assertOk();
        $this->assertStringContainsString('application/pdf', $responseView->headers->get('content-type'));

        $responseDownload = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/dokumen/{$dok->id_dokumen}/download");
        $responseDownload->assertOk();
        $this->assertStringContainsString('application/pdf', $responseDownload->headers->get('content-type'));
    }

    /**
     * Verifikasi pelamar dibatasi maksimal 3 kali pengajuan jadwal ulang
     */
    public function test_pelamar_dibatasi_maksimal_3_kali_reschedule()
    {
        // Pengajuan 1
        $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-15',
                'waktu_baru'   => '10.00 WIB',
            ])->assertSessionHas('success');

        // HRD Tolak pengajuan 1 agar status kembali Terjadwal
        $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/reschedule-reject", [
                'alasan_penolakan' => 'Jadwal penuh',
            ])->assertSessionHas('success');

        // Pengajuan 2
        $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-16',
                'waktu_baru'   => '11.00 WIB',
            ])->assertSessionHas('success');

        // HRD Tolak pengajuan 2
        $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/reschedule-reject", [
                'alasan_penolakan' => 'Pewawancara cuti',
            ])->assertSessionHas('success');

        // Pengajuan 3
        $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-17',
                'waktu_baru'   => '13.00 WIB',
            ])->assertSessionHas('success');

        // HRD Tolak pengajuan 3
        $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/reschedule-reject", [
                'alasan_penolakan' => 'Ruang rapat terpakai',
            ])->assertSessionHas('success');

        // Pengajuan 4 -> HARUS DITOLAK / DIKUNCI
        $response4 = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->post("/pelamar/interviews/{$this->wawancara->id_wawancara}/reschedule", [
                'tanggal_baru' => '2026-09-18',
                'waktu_baru'   => '14.00 WIB',
            ]);

        $response4->assertSessionHasErrors(['reschedule']);
    }

    /**
     * Verifikasi HRD dapat menerima pengajuan jadwal ulang dengan catatan
     */
    public function test_hrd_bisa_menerima_pengajuan_jadwal_ulang()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/reschedule", [
                'tanggal_wawancara' => '2026-10-15T10:00',
                'link_meeting'      => 'https://meet.google.com/test-baru',
                'format_wawancara'  => 'Online',
                'alasan_hrd'        => 'Disetujui sesuai ketersediaan ruangan',
            ]);

        $response->assertRedirect(route('hrd.manajemen-kandidat'));
        $this->assertDatabaseHas('jadwal_wawancara', [
            'id_lamaran'       => $this->lamaran->id_lamaran,
            'status_wawancara' => 'Terjadwal',
            'link_meeting'     => 'https://meet.google.com/test-baru',
        ]);
    }

    /**
     * HRD 22: HRD mengunggah Surat Keputusan (SK) format PDF dan Pelamar dapat mengunduhnya
     */
    public function test_hrd22_upload_surat_keputusan_dan_download_pelamar()
    {
        Storage::fake('local');
        $pdfSk = UploadedFile::fake()->create('surat_keputusan_resmi.pdf', 300, 'application/pdf');

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post("/hrd/kandidat/{$this->lamaran->id_lamaran}/surat-keputusan", [
                'file_sk' => $pdfSk,
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('dokumen_pelamar', [
            'id_lamaran'    => $this->lamaran->id_lamaran,
            'jenis_dokumen' => 'Surat Keputusan',
        ]);

        // Pelamar mengunduh Surat Keputusan yang baru diunggah
        $downloadResponse = $this->actingAs($this->pelamarAktif, 'pelamar')
            ->get("/pelamar/applications/{$this->lamaran->id_lamaran}/surat-keputusan");

        $downloadResponse->assertOk();
    }

    /**
     * Pelamar 9: Skor kecocokan CV kosong adalah 0%
     */
    public function test_pelamar9_skor_cv_kosong_adalah_nol()
    {
        Storage::fake('local');
        $emptyPdf = UploadedFile::fake()->create('cv_kosong.pdf', 0, 'application/pdf');

        $lowonganBaru = Lowongan::create([
            'id_hrd' => $this->hrd->id_hrd,
            'posisi' => 'DevOps Engineer',
            'departemen' => 'Infrastructure',
            'lokasi' => 'Remote',
            'tipe_pekerjaan' => 'Full-Time',
            'status_lowongan' => 'Aktif',
            'gaji_min' => 12000000,
            'gaji_max' => 18000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'deskripsi' => 'Kubernetes, Docker, CI/CD pipelines.',
            'kualifikasi' => 'AWS, Terraform, Linux administration.',
        ]);

        $this->actingAs($this->pelamarBaru, 'pelamar')
            ->post("/pelamar/jobs/{$lowonganBaru->id_lowongan}/apply", [
                'file_dokumen' => $emptyPdf,
                'jenis_dokumen' => 'CV / Resume',
            ]);

        $lamaranBaru = Lamaran::where('id_pelamar', $this->pelamarBaru->id_pelamar)
            ->where('id_lowongan', $lowonganBaru->id_lowongan)
            ->first();

        $this->assertNotNull($lamaranBaru);
        $this->assertEquals(0.0, (float) $lamaranBaru->skor_kecocokan);
    }
}

