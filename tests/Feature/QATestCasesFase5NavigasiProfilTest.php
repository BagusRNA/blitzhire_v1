<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use App\Models\Pelamar;
use App\Models\Lowongan;
use App\Models\Lamaran;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

class QATestCasesFase5NavigasiProfilTest extends TestCase
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
            'kata_sandi' => Hash::make('password123'),
            'nomor_hp' => '081234567890',
            'alamat' => 'Jl. Merdeka No. 10 Bandung',
            'pendidikan_terakhir' => 'S1',
        ]);

        $this->lowongan = Lowongan::create([
            'posisi' => 'Frontend Developer',
            'departemen' => 'Engineering',
            'tipe_pekerjaan' => 'Full-Time',
            'lokasi' => 'Bandung',
            'deskripsi' => 'Dibutuhkan developer React.',
            'kualifikasi' => 'S1 Teknik Informatika, Menguasai React & Tailwind.',
            'gaji_min' => 8000000,
            'gaji_max' => 12000000,
            'tanggal_buka' => '2026-09-01',
            'tanggal_tutup' => '2026-10-01',
            'status_lowongan' => 'Aktif',
            'id_hrd' => $this->hrd->id_hrd,
        ]);

        $this->lamaran = Lamaran::create([
            'id_pelamar' => $this->pelamar->id_pelamar,
            'id_lowongan' => $this->lowongan->id_lowongan,
            'status_lamaran' => 'Screening',
            'skor_kecocokan' => 88,
            'tanggal_lamaran' => now(),
        ]);
    }

    /**
     * HRD 13: Menu Profile pada halaman Admin/HRD menampilkan halaman Profile Admin/HRD
     */
    public function test_hrd13_menu_profile_hrd_dapat_diakses_dan_diperbarui()
    {
        // 1. Akses halaman profile HRD
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/profile');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Profile')
            ->has('hrd')
            ->where('hrd.email', 'adminhrd@blitzhire.test')
            ->where('hrd.nama_pengguna', 'adminhrd')
        );

        // 2. Update profile HRD
        $updateResponse = $this->actingAs($this->hrd, 'hrd')
            ->patch('/hrd/profile', [
                'nama_pengguna' => 'admin_updated',
                'email' => 'admin_updated@blitzhire.test',
                'kata_sandi' => 'newpassword123',
                'kata_sandi_confirmation' => 'newpassword123',
            ]);

        $updateResponse->assertRedirect();
        $updateResponse->assertSessionHas('success', 'Profil Admin/HRD berhasil diperbarui.');

        $this->hrd->refresh();
        $this->assertEquals('admin_updated', $this->hrd->nama_pengguna);
        $this->assertEquals('admin_updated@blitzhire.test', $this->hrd->email);
        $this->assertTrue(Hash::check('newpassword123', $this->hrd->kata_sandi));
    }

    /**
     * HRD 14: Navigasi Dashboard HRD menyediakan rute Dashboard, Profile, dan Logout
     */
    public function test_hrd14_navigasi_dashboard_hrd_menyediakan_rute_profile_dan_dashboard()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Dashboard')
            ->has('stats')
        );

        // Pastikan route profile dan dashboard terdaftar
        $this->assertTrue(\Route::has('hrd.profile'));
        $this->assertTrue(\Route::has('hrd.dashboard'));
        $this->assertTrue(\Route::has('hrd.auth.logout'));
    }

    /**
     * HRD 16: "Open Details" pada data pelamar di Dashboard HRD mengarahkan ke Detail Pelamar
     */
    public function test_hrd16_open_details_membuka_detail_data_pelamar_yang_dipilih()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get("/hrd/kandidat/{$this->lamaran->id_lamaran}/detail");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/Kandidat/DetailPelamar')
            ->has('lamaran')
            ->where('lamaran.id_lamaran', $this->lamaran->id_lamaran)
            ->where('lamaran.pelamar.nama_lengkap', 'Budi Santoso')
        );
    }

    /**
     * Pelamar 1: Muncul pop up "Akun anda berhasil dibuat" setelah registrasi berhasil
     */
    public function test_pelamar1_registrasi_berhasil_menampilkan_status_dan_pop_up()
    {
        $uniqueEmail = 'calon_karyawan_' . time() . '@gmail.com';

        $response = $this->post('/kandidat/register', [
            'nama_lengkap'            => 'Calon Pelamar Hebat',
            'email'                   => $uniqueEmail,
            'kata_sandi'              => 'password123',
            'kata_sandi_confirmation' => 'password123',
            'nomor_hp'                => '081987654321',
            'alamat'                  => 'Jl. Asia Afrika No. 50 Bandung',
            'pendidikan_terakhir'     => 'S1',
        ]);

        $response->assertRedirect('/kandidat/login');
        $response->assertSessionHas('status');

        // Pastikan saat redirect ke login, status diteruskan ke props Inertia
        $loginResponse = $this->withSession(['status' => 'Akun berhasil dibuat!'])
            ->get('/kandidat/login');

        $loginResponse->assertStatus(200);
        $loginResponse->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Pelamar/Login')
            ->where('status', 'Akun berhasil dibuat!')
        );
    }

    /**
     * Pelamar 2: Menu Profile pada halaman pelamar menampilkan halaman Profile Pelamar
     */
    public function test_pelamar2_menu_profile_pelamar_dapat_diakses_dan_diperbarui()
    {
        // 1. Akses halaman profile Pelamar
        $response = $this->actingAs($this->pelamar, 'pelamar')
            ->get('/pelamar/profile');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pelamar/Profile')
            ->has('pelamar')
            ->where('pelamar.email', 'budi.santoso@gmail.com')
            ->where('pelamar.nama_lengkap', 'Budi Santoso')
        );

        // 2. Update profile Pelamar
        $updateResponse = $this->actingAs($this->pelamar, 'pelamar')
            ->patch('/pelamar/profile', [
                'nama_lengkap' => 'Budi Santoso, S.Kom.',
                'email' => 'budi.santoso.updated@gmail.com',
                'nomor_hp' => '081299998888',
                'pendidikan_terakhir' => 'S2',
                'alamat' => 'Jl. Dipatiukur No. 12 Bandung',
                'kata_sandi' => 'newpassword123',
                'kata_sandi_confirmation' => 'newpassword123',
            ]);

        $updateResponse->assertRedirect();
        $updateResponse->assertSessionHas('success', 'Profil pelamar berhasil diperbarui.');

        $this->pelamar->refresh();
        $this->assertEquals('Budi Santoso, S.Kom.', $this->pelamar->nama_lengkap);
        $this->assertEquals('budi.santoso.updated@gmail.com', $this->pelamar->email);
        $this->assertEquals('081299998888', $this->pelamar->nomor_hp);
        $this->assertEquals('S2', $this->pelamar->pendidikan_terakhir);
        $this->assertTrue(Hash::check('newpassword123', $this->pelamar->kata_sandi));
    }

    /**
     * Pelamar 6: Akun baru pelamar tersimpan di tabel 'pelamar' (bukan tabel 'users')
     */
    public function test_pelamar6_akun_baru_pelamar_tersimpan_di_tabel_pelamar_bukan_users()
    {
        $uniqueEmail = 'verifikasi_tabel_' . time() . '@gmail.com';

        $this->post('/kandidat/register', [
            'nama_lengkap'            => 'Verifikasi Tabel User',
            'email'                   => $uniqueEmail,
            'kata_sandi'              => 'password123',
            'kata_sandi_confirmation' => 'password123',
            'nomor_hp'                => '081234567899',
            'alamat'                  => 'Bandung',
            'pendidikan_terakhir'     => 'D3',
        ]);

        // 1. Verifikasi data tersimpan di tabel 'pelamar'
        $this->assertDatabaseHas('pelamar', [
            'email' => $uniqueEmail,
            'nama_lengkap' => 'Verifikasi Tabel User',
            'pendidikan_terakhir' => 'D3',
        ]);

        // 2. Verifikasi tabel 'users' TIDAK menyimpan akun pelamar (sesuai arsitektur multi-guard BlitzHire)
        $this->assertDatabaseMissing('users', [
            'email' => $uniqueEmail,
        ]);
    }
}
