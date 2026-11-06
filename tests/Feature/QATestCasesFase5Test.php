<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HRD;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

class QATestCasesFase5Test extends TestCase
{
    use DatabaseMigrations;

    protected $hrd;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hrd = HRD::create([
            'email' => 'adminhrd@blitzhire.test',
            'nama_pengguna' => 'adminhrd',
            'kata_sandi' => Hash::make('hrd12345'),
        ]);
    }

    /**
     * IR15 / TC62: Halaman Konfigurasi Penilaian dapat diakses
     */
    public function test_tc62_konfigurasi_penilaian_page_renders()
    {
        $response = $this->actingAs($this->hrd, 'hrd')
            ->get('/hrd/konfigurasi-penilaian');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('HRD/KonfigurasiPenilaian')
            ->has('thresholds')
            ->has('categories')
        );
    }

    /**
     * TC63 & TC68: HRD menyimpan konfigurasi penilaian dengan nilai valid dan total bobot 100%
     */
    public function test_tc63_tc68_simpan_konfigurasi_valid_berhasil()
    {
        $validThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '70%'],
            ['label' => 'Skor Auto-Reject', 'key' => 'auto_reject', 'value' => '40%'],
            ['label' => 'Skor Minimum tanpa Screening', 'key' => 'auto_pass', 'value' => '85%'],
        ];

        $validCategories = [
            ['name' => 'Pendidikan', 'weight' => '20%', 'chips' => ['S1', 'D3']],
            ['name' => 'Pengalaman Kerja', 'weight' => '30%', 'chips' => ['3 tahun']],
            ['name' => 'Technical Skills', 'weight' => '40%', 'chips' => ['React', 'Laravel']],
            ['name' => 'Soft Skills', 'weight' => '10%', 'chips' => ['Komunikasi']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $validThresholds,
                'categories' => $validCategories,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Konfigurasi penilaian berhasil disimpan.');
    }

    /**
     * IR16 / TC64: HRD mengatur batas skor otomatis dengan nilai lebih dari 100% ditolak
     */
    public function test_tc64_simpan_konfigurasi_skor_lebih_dari_100_ditolak()
    {
        $invalidThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '110%'],
            ['label' => 'Skor Auto-Reject', 'key' => 'auto_reject', 'value' => '40%'],
        ];

        $validCategories = [
            ['name' => 'Pendidikan', 'weight' => '50%', 'chips' => ['S1']],
            ['name' => 'Pengalaman Kerja', 'weight' => '50%', 'chips' => ['1 tahun']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $invalidThresholds,
                'categories' => $validCategories,
            ]);

        $response->assertSessionHasErrors(['thresholds']);
        $this->assertEquals('Nilai tidak valid!', session('errors')->first('thresholds'));
    }

    /**
     * IR17 / TC65: HRD tidak mengisi batas skor otomatis (dikosongkan) ditolak
     */
    public function test_tc65_simpan_konfigurasi_skor_kosong_ditolak()
    {
        $emptyThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => ''],
        ];

        $validCategories = [
            ['name' => 'Pendidikan', 'weight' => '100%', 'chips' => ['S1']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $emptyThresholds,
                'categories' => $validCategories,
            ]);

        $response->assertSessionHasErrors(['thresholds']);
        $this->assertEquals('Tidak boleh kosong!', session('errors')->first('thresholds'));
    }

    /**
     * IR18 / TC67: HRD menambahkan keyword yang telah terdaftar (duplikat) ditolak
     */
    public function test_tc67_tambah_keyword_duplikat_ditolak()
    {
        $validThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '60%'],
        ];

        // Duplikat 'D3' pada kategori Pendidikan
        $duplicateCategories = [
            ['name' => 'Pendidikan', 'weight' => '100%', 'chips' => ['D3', 'D3']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $validThresholds,
                'categories' => $duplicateCategories,
            ]);

        $response->assertSessionHasErrors(['categories']);
        $this->assertEquals('Kategori sudah ada!', session('errors')->first('categories'));
    }

    /**
     * IR19 / TC69: HRD mengatur total bobot kategori kurang dari 100% ditolak
     */
    public function test_tc69_total_bobot_kurang_dari_100_ditolak()
    {
        $validThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '60%'],
        ];

        // Total bobot = 20 + 20 + 30 + 20 = 90% (< 100%)
        $categories90 = [
            ['name' => 'Pendidikan', 'weight' => '20%', 'chips' => ['S1']],
            ['name' => 'Pengalaman', 'weight' => '20%', 'chips' => ['1 thn']],
            ['name' => 'Technical Skills', 'weight' => '30%', 'chips' => ['PHP']],
            ['name' => 'Soft Skills', 'weight' => '20%', 'chips' => ['Teamwork']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $validThresholds,
                'categories' => $categories90,
            ]);

        $response->assertSessionHasErrors(['categories']);
        $this->assertEquals('Konfigurasi tidak valid!', session('errors')->first('categories'));
    }

    /**
     * IR20 / TC70: HRD mengatur total bobot kategori lebih dari 100% ditolak
     */
    public function test_tc70_total_bobot_lebih_dari_100_ditolak()
    {
        $validThresholds = [
            ['label' => 'Skor Minimum Lanjut Screening', 'key' => 'min_screening', 'value' => '60%'],
        ];

        // Total bobot = 30 + 30 + 30 + 20 = 110% (> 100%)
        $categories110 = [
            ['name' => 'Pendidikan', 'weight' => '30%', 'chips' => ['S1']],
            ['name' => 'Pengalaman', 'weight' => '30%', 'chips' => ['1 thn']],
            ['name' => 'Technical Skills', 'weight' => '30%', 'chips' => ['PHP']],
            ['name' => 'Soft Skills', 'weight' => '20%', 'chips' => ['Teamwork']],
        ];

        $response = $this->actingAs($this->hrd, 'hrd')
            ->post('/hrd/konfigurasi-penilaian', [
                'thresholds' => $validThresholds,
                'categories' => $categories110,
            ]);

        $response->assertSessionHasErrors(['categories']);
        $this->assertEquals('Konfigurasi tidak valid!', session('errors')->first('categories'));
    }
}

