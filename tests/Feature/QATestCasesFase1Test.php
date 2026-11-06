<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use App\Models\Pelamar;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;

class QATestCasesFase1Test extends TestCase
{
    use DatabaseMigrations;
    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure test HRD exists
        HRD::firstOrCreate(
            ['email' => 'adminhrd@gmail.com'],
            [
                'nama_pengguna' => 'adminhrd',
                'kata_sandi' => Hash::make('hrd12345'),
            ]
        );

        // Ensure test Pelamar exists
        Pelamar::firstOrCreate(
            ['email' => 'pelamar@gmail.com'],
            [
                'nama_lengkap' => 'Budi Pelamar',
                'kata_sandi' => Hash::make('tes12345'),
                'nomor_hp' => '08123456789',
                'alamat' => 'Jl. Mawar No. 10',
                'pendidikan_terakhir' => 'S1 Teknik Informatika',
            ]
        );
    }

    /** TC01: Login HRD page render */
    public function test_tc01_hrd_login_page_renders()
    {
        $response = $this->get('/hrd-login');
        $response->assertStatus(200);
    }

    /** TC02: HRD login valid */
    public function test_tc02_hrd_login_valid()
    {
        $response = $this->post('/hrd-login', [
            'email' => 'adminhrd@gmail.com',
            'kata_sandi' => 'hrd12345',
        ]);
        $response->assertRedirect('/hrd/dashboard');
    }

    /** TC03: HRD login password empty */
    public function test_tc03_hrd_login_password_empty()
    {
        $response = $this->post('/hrd-login', [
            'email' => 'adminhrd@gmail.com',
            'kata_sandi' => '',
        ]);
        $response->assertSessionHasErrors(['kata_sandi' => 'Password harus diisi!']);
    }

    /** TC04: HRD login email empty */
    public function test_tc04_hrd_login_email_empty()
    {
        $response = $this->post('/hrd-login', [
            'email' => '',
            'kata_sandi' => 'hrd12345',
        ]);
        $response->assertSessionHasErrors(['email' => 'Email tidak boleh kosong!']);
    }

    /** TC05: HRD login both empty */
    public function test_tc05_hrd_login_both_empty()
    {
        $response = $this->post('/hrd-login', [
            'email' => '',
            'kata_sandi' => '',
        ]);
        $response->assertSessionHasErrors(['email' => 'Kredensial tidak boleh kosong!']);
    }

    /** TC06 & TC07: HRD login invalid credentials */
    public function test_tc06_tc07_hrd_login_invalid()
    {
        $response = $this->post('/hrd-login', [
            'email' => 'adminhrd@gmail.com',
            'kata_sandi' => 'salah123',
        ]);
        $response->assertSessionHasErrors(['email' => 'Email atau password tidak sesuai!']);
    }

    /** TC09: Lupa Kata Sandi - email valid (adminhrd@gmail.com) */
    public function test_tc09_forgot_password_valid_email()
    {
        $response = $this->post('/forgot-password', [
            'email' => 'adminhrd@gmail.com',
        ]);
        $response->assertSessionHas('status', 'Konfirmasi telah dikirim: cek email mu');
        $this->assertEquals('otp', session('reset_step'));
    }

    /** TC10: Lupa Kata Sandi - email tidak terdaftar */
    public function test_tc10_forgot_password_unregistered_email()
    {
        $response = $this->post('/forgot-password', [
            'email' => 'namasaya@gmail.com',
        ]);
        $response->assertSessionHasErrors(['email' => 'Email tidak ditemukan!']);
    }

    /** TC11: Kode OTP valid (123456) */
    public function test_tc11_otp_valid()
    {
        session(['reset_step' => 'otp', 'reset_email' => 'adminhrd@gmail.com', 'reset_otp' => '123456']);
        $response = $this->post('/forgot-password/verify-otp', [
            'kode' => '123456',
        ]);
        $response->assertSessionHas('status', 'Kode OTP terkonfirmasi!');
        $this->assertEquals('new_password', session('reset_step'));
    }

    /** TC12: Kode OTP tidak valid (654321) */
    public function test_tc12_otp_invalid()
    {
        session(['reset_step' => 'otp', 'reset_email' => 'adminhrd@gmail.com', 'reset_otp' => '123456']);
        $response = $this->post('/forgot-password/verify-otp', [
            'kode' => '654321',
        ]);
        $response->assertSessionHasErrors(['kode' => 'Kode OTP tidak valid!']);
    }

    /** TC13: Password baru dan konfirmasi sesuai */
    public function test_tc13_password_baru_sesuai()
    {
        session([
            'reset_step'   => 'new_password',
            'reset_email'  => 'adminhrd@gmail.com',
            'reset_role'   => 'hrd',
            'otp_verified' => true
        ]);

        $response = $this->post('/forgot-password/reset', [
            'kata_sandi_baru'              => 'baru1234',
            'konfirmasi_kata_sandi'        => 'baru1234',
        ]);

        $response->assertRedirect('/hrd-login');
        $response->assertSessionHas('status', 'Kata sandi baru berhasil dibuat!');
    }

    /** TC14: Password baru dan konfirmasi tidak sesuai */
    public function test_tc14_password_baru_mismatch()
    {
        session([
            'reset_step'   => 'new_password',
            'reset_email'  => 'adminhrd@gmail.com',
            'reset_role'   => 'hrd',
            'otp_verified' => true
        ]);

        $response = $this->post('/forgot-password/reset', [
            'kata_sandi_baru'              => 'baru1234',
            'konfirmasi_kata_sandi'        => 'baru1235',
        ]);

        $response->assertSessionHasErrors(['kata_sandi_baru_confirmation' => 'Password salah!']);
    }

    /** TC23: Register mengosongkan salah satu field */
    public function test_tc23_register_empty_field()
    {
        $response = $this->post('/kandidat/register', [
            'nama_lengkap'            => '',
            'email'                   => 'pelamar1@gmail.com',
            'kata_sandi'              => 'tes12345',
            'kata_sandi_confirmation' => 'tes12345',
            'nomor_hp'                => '08123456789',
            'alamat'                  => 'Jl. Sudirman No. 1',
            'pendidikan_terakhir'     => 'D3',
        ]);

        $response->assertSessionHasErrors(['nama_lengkap' => 'Semua field harus diisi!']);
    }

    /** TC27 / IR27: Register email tidak valid (pelamar@gmail.om) */
    public function test_tc27_register_invalid_email_domain()
    {
        $response = $this->post('/kandidat/register', [
            'nama_lengkap'            => 'Pelamar Baru',
            'email'                   => 'pelamar@gmail.om',
            'kata_sandi'              => 'tes12345',
            'kata_sandi_confirmation' => 'tes12345',
            'nomor_hp'                => '08123456789',
            'alamat'                  => 'Jl. Sudirman No. 1',
            'pendidikan_terakhir'     => 'D3',
        ]);

        $response->assertSessionHasErrors(['email' => 'Email tidak valid!']);
    }

    /** TC28: Register konfirmasi password salah */
    public function test_tc28_register_password_mismatch()
    {
        $response = $this->post('/kandidat/register', [
            'nama_lengkap'            => 'Pelamar Baru',
            'email'                   => 'pelamar_valid@gmail.com',
            'kata_sandi'              => 'tes12345',
            'kata_sandi_confirmation' => 'tes1234',
            'nomor_hp'                => '08123456789',
            'alamat'                  => 'Jl. Sudirman No. 1',
            'pendidikan_terakhir'     => 'D3',
        ]);

        $response->assertSessionHasErrors(['kata_sandi_confirmation' => 'Password salah!']);
    }

    /** TC22: Register valid */
    public function test_tc22_register_valid()
    {
        $uniqueEmail = 'pelamar_' . time() . '@gmail.com';
        $response = $this->post('/kandidat/register', [
            'nama_lengkap'            => 'Pelamar Baru Valid',
            'email'                   => $uniqueEmail,
            'kata_sandi'              => 'tes12345',
            'kata_sandi_confirmation' => 'tes12345',
            'nomor_hp'                => '08123456789',
            'alamat'                  => 'Jl. Sudirman No. 1',
            'pendidikan_terakhir'     => 'D3',
        ]);

        $response->assertRedirect('/kandidat/login');
        $response->assertSessionHas('status', 'Akun berhasil dibuat!');
    }
}
