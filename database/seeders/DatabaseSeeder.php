<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('penawaran')->delete();
        DB::table('jadwal_wawancara')->delete();
        DB::table('dokumen_pelamar')->delete();
        DB::table('lamaran')->delete();
        DB::table('lowongan')->delete();
        DB::table('pelamar')->delete();
        DB::table('hrd')->delete();

        $hrdId = DB::table('hrd')->insertGetId([
            'nama_pengguna' => 'Admin HRD',
            'email' => 'hrd@blitzhire.com',
            'kata_sandi' => Hash::make('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $positions = [
            [
                'posisi' => 'Senior Full-Stack Engineer',
                'lokasi' => 'Jakarta Selatan',
                'tipe_pekerjaan' => 'Full-Time',
                'departemen' => 'Engineering',
                'status_lowongan' => 'Aktif',
                'deskripsi' => 'Membangun aplikasi enterprise berbasis Laravel dan React untuk kebutuhan internal dan customer-facing.',
                'kualifikasi' => '- Minimal 3 tahun pengalaman backend/frontend\n- Menguasai PHP, Laravel, JavaScript, React\n- Mampu bekerja dalam tim cross-functional',
                'gaji_min' => 12000000,
                'gaji_max' => 22000000,
            ],
            [
                'posisi' => 'UI/UX Designer',
                'lokasi' => 'Bandung',
                'tipe_pekerjaan' => 'Full-Time',
                'departemen' => 'Design',
                'status_lowongan' => 'Aktif',
                'deskripsi' => 'Merancang pengalaman pengguna dan prototipe produk yang intuitif, responsif, dan menarik untuk platform BlitzHire.',
                'kualifikasi' => '- Memiliki portofolio desain digital\n- Mahir di Figma dan design system\n- Memahami user research dan usability testing',
                'gaji_min' => 9000000,
                'gaji_max' => 17000000,
            ],
            [
                'posisi' => 'Data Analyst',
                'lokasi' => 'Jakarta Pusat',
                'tipe_pekerjaan' => 'Hybrid',
                'departemen' => 'Product',
                'status_lowongan' => 'Aktif',
                'deskripsi' => 'Menganalisis performa produk, mengolah data, dan menyajikan insight untuk mendukung keputusan bisnis.',
                'kualifikasi' => '- Pengalaman BI tools seperti Looker atau Metabase\n- Menguasai SQL dan Excel\n- Memiliki kemampuan storytelling data',
                'gaji_min' => 10000000,
                'gaji_max' => 18000000,
            ],
            [
                'posisi' => 'QA Automation Engineer',
                'lokasi' => 'Yogyakarta',
                'tipe_pekerjaan' => 'Contract',
                'departemen' => 'Engineering',
                'status_lowongan' => 'Aktif',
                'deskripsi' => 'Menyusun dan menjalankan otomasi testing agar kualitas produk terjaga secara konsisten di setiap release.',
                'kualifikasi' => '- Memahami test plan dan test case\n- Pengalaman automation testing dengan Playwright atau Cypress\n- Familiar dengan CI/CD',
                'gaji_min' => 8000000,
                'gaji_max' => 15000000,
            ],
            [
                'posisi' => 'Product Manager',
                'lokasi' => 'Jakarta Selatan',
                'tipe_pekerjaan' => 'Full-Time',
                'departemen' => 'Product',
                'status_lowongan' => 'Aktif',
                'deskripsi' => 'Memimpin roadmap produk, menganalisis kebutuhan pasar, dan mengkoordinasikan prioritas fitur dari ide hingga launch.',
                'kualifikasi' => '- Minimal 4 tahun sebagai Product Manager\n- Memahami product lifecycle\n- Memiliki skill komunikasi dan analisis yang kuat',
                'gaji_min' => 15000000,
                'gaji_max' => 26000000,
            ],
        ];

        $jobIds = [];
        foreach ($positions as $job) {
            $jobIds[] = DB::table('lowongan')->insertGetId([
                'id_hrd' => $hrdId,
                'posisi' => $job['posisi'],
                'lokasi' => $job['lokasi'],
                'status_lowongan' => $job['status_lowongan'],
                'tipe_pekerjaan' => $job['tipe_pekerjaan'],
                'departemen' => $job['departemen'],
                'deskripsi' => $job['deskripsi'],
                'kualifikasi' => $job['kualifikasi'],
                'tanggal_buka' => Carbon::now()->subDays(10)->toDateString(),
                'tanggal_tutup' => Carbon::now()->addDays(30)->toDateString(),
                'gaji_min' => $job['gaji_min'],
                'gaji_max' => $job['gaji_max'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $candidateData = [
            ['nama_lengkap' => 'Adit Pratama', 'email' => 'adit.pratama@gmail.com', 'nomor_hp' => '081234560001', 'alamat' => 'Jl. Cempaka No. 12, Jakarta', 'pendidikan_terakhir' => 'S1 Teknik Informatika'],
            ['nama_lengkap' => 'Bunga Lestari', 'email' => 'bunga.lestari@gmail.com', 'nomor_hp' => '081234560002', 'alamat' => 'Jl. Mawar No. 8, Bandung', 'pendidikan_terakhir' => 'D3 Desain Komunikasi Visual'],
            ['nama_lengkap' => 'Candra Wijaya', 'email' => 'candra.wijaya@gmail.com', 'nomor_hp' => '081234560003', 'alamat' => 'Jl. Merdeka No. 5, Surabaya', 'pendidikan_terakhir' => 'S1 Statistika'],
            ['nama_lengkap' => 'Desi Rahma', 'email' => 'desi.rahma@gmail.com', 'nomor_hp' => '081234560004', 'alamat' => 'Jl. Kenanga No. 21, Yogyakarta', 'pendidikan_terakhir' => 'S1 Teknik Elektro'],
            ['nama_lengkap' => 'Eko Setiawan', 'email' => 'eko.setiawan@gmail.com', 'nomor_hp' => '081234560005', 'alamat' => 'Jl. Diponegoro No. 17, Semarang', 'pendidikan_terakhir' => 'S1 Teknik Komputer'],
            ['nama_lengkap' => 'Farah Nabilah', 'email' => 'farah.nabilah@gmail.com', 'nomor_hp' => '081234560006', 'alamat' => 'Jl. Panjang No. 2, Bekasi', 'pendidikan_terakhir' => 'S1 Manajemen'],
            ['nama_lengkap' => 'Gita Mariana', 'email' => 'gita.mariana@gmail.com', 'nomor_hp' => '081234560007', 'alamat' => 'Jl. Cikini No. 40, Jakarta', 'pendidikan_terakhir' => 'S1 Sistem Informasi'],
            ['nama_lengkap' => 'Hendra Putra', 'email' => 'hendra.putra@gmail.com', 'nomor_hp' => '081234560008', 'alamat' => 'Jl. Raya Bogor No. 11, Depok', 'pendidikan_terakhir' => 'S1 Manajemen Bisnis'],
        ];

        $pelamarIds = [];
        foreach ($candidateData as $candidate) {
            $pelamarIds[] = DB::table('pelamar')->insertGetId([
                'nama_lengkap' => $candidate['nama_lengkap'],
                'email' => $candidate['email'],
                'kata_sandi' => Hash::make('password'),
                'nomor_hp' => $candidate['nomor_hp'],
                'alamat' => $candidate['alamat'],
                'pendidikan_terakhir' => $candidate['pendidikan_terakhir'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $lamaranIds = [];
        $lamaranRows = [
            ['id_pelamar' => $pelamarIds[0], 'id_lowongan' => $jobIds[0], 'status_lamaran' => 'Screening', 'tanggal_lamaran' => Carbon::now()->subDays(7), 'skor_kecocokan' => 81.50],
            ['id_pelamar' => $pelamarIds[1], 'id_lowongan' => $jobIds[1], 'status_lamaran' => 'Screening', 'tanggal_lamaran' => Carbon::now()->subDays(6), 'skor_kecocokan' => 76.00],
            ['id_pelamar' => $pelamarIds[2], 'id_lowongan' => $jobIds[2], 'status_lamaran' => 'Wawancara', 'tanggal_lamaran' => Carbon::now()->subDays(9), 'skor_kecocokan' => 88.25],
            ['id_pelamar' => $pelamarIds[3], 'id_lowongan' => $jobIds[3], 'status_lamaran' => 'Wawancara', 'tanggal_lamaran' => Carbon::now()->subDays(8), 'skor_kecocokan' => 84.75],
            ['id_pelamar' => $pelamarIds[4], 'id_lowongan' => $jobIds[0], 'status_lamaran' => 'Offer', 'tanggal_lamaran' => Carbon::now()->subDays(12), 'skor_kecocokan' => 90.40],
            ['id_pelamar' => $pelamarIds[5], 'id_lowongan' => $jobIds[4], 'status_lamaran' => 'Offer', 'tanggal_lamaran' => Carbon::now()->subDays(11), 'skor_kecocokan' => 93.10],
            ['id_pelamar' => $pelamarIds[6], 'id_lowongan' => $jobIds[2], 'status_lamaran' => 'Diterima', 'tanggal_lamaran' => Carbon::now()->subDays(14), 'skor_kecocokan' => 95.20],
            ['id_pelamar' => $pelamarIds[7], 'id_lowongan' => $jobIds[4], 'status_lamaran' => 'Ditolak', 'tanggal_lamaran' => Carbon::now()->subDays(10), 'skor_kecocokan' => 61.00],
        ];

        foreach ($lamaranRows as $row) {
            $lamaranIds[] = DB::table('lamaran')->insertGetId([
                'id_pelamar' => $row['id_pelamar'],
                'id_lowongan' => $row['id_lowongan'],
                'tanggal_lamaran' => $row['tanggal_lamaran']->toDateString(),
                'status_lamaran' => $row['status_lamaran'],
                'skor_kecocokan' => $row['skor_kecocokan'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $documents = [
            ['id_lamaran' => $lamaranIds[0], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'adit_cv.pdf', 'path_file' => 'dummy/adit_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(6)],
            ['id_lamaran' => $lamaranIds[1], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'bunga_cv.pdf', 'path_file' => 'dummy/bunga_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(5)],
            ['id_lamaran' => $lamaranIds[2], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'candra_cv.pdf', 'path_file' => 'dummy/candra_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(8)],
            ['id_lamaran' => $lamaranIds[3], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'desi_cv.pdf', 'path_file' => 'dummy/desi_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(7)],
            ['id_lamaran' => $lamaranIds[4], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'eko_cv.pdf', 'path_file' => 'dummy/eko_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(11)],
            ['id_lamaran' => $lamaranIds[5], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'farah_cv.pdf', 'path_file' => 'dummy/farah_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(10)],
            ['id_lamaran' => $lamaranIds[6], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'gita_cv.pdf', 'path_file' => 'dummy/gita_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(13)],
            ['id_lamaran' => $lamaranIds[7], 'jenis_dokumen' => 'CV / Resume', 'file_dokumen' => 'hendra_cv.pdf', 'path_file' => 'dummy/hendra_cv.pdf', 'tanggal_upload' => Carbon::now()->subDays(9)],
        ];

        DB::table('dokumen_pelamar')->insert($documents);

        $interviews = [
            [
                'id_lamaran' => $lamaranIds[2],
                'tanggal_wawancara' => Carbon::now()->addDays(2)->setTime(10, 0, 0),
                'lokasi' => 'Google Meet',
                'interviewer' => 'Head of Product',
                'status_wawancara' => 'Terjadwal',
                'format_wawancara' => 'Online',
                'link_meeting' => 'https://meet.google.com/xyz-abcd-efg',
                'catatan' => 'Diskusikan analisis bisnis dan prioritas KPI produk.',
                'hasil_assigment' => null,
            ],
            [
                'id_lamaran' => $lamaranIds[3],
                'tanggal_wawancara' => Carbon::now()->subDays(2)->setTime(13, 30, 0),
                'lokasi' => 'Ruang Rapat 3',
                'interviewer' => 'Engineering Manager',
                'status_wawancara' => 'Selesai',
                'format_wawancara' => 'Offline',
                'link_meeting' => null,
                'catatan' => 'Pemahaman QA automation sudah bagus dan komunikasi tim cukup kuat.',
                'hasil_assigment' => 'Lolos ke tahap selanjutnya untuk kandidat yang dinilai mampu mengelola test strategy.',
            ],
        ];

        DB::table('jadwal_wawancara')->insert($interviews);

        $offers = [
            [
                'id_lamaran' => $lamaranIds[4],
                'nominal_gaji' => 18500000,
                'posisi_kerja' => 'Senior Full-Stack Engineer',
                'lokasi_kerja' => 'Jakarta Selatan',
                'status_penawaran' => 'Menunggu',
                'tanggal_penawaran' => Carbon::now()->subDays(2)->toDateString(),
            ],
            [
                'id_lamaran' => $lamaranIds[5],
                'nominal_gaji' => 22000000,
                'posisi_kerja' => 'Product Manager',
                'lokasi_kerja' => 'Jakarta Selatan',
                'status_penawaran' => 'Diterima',
                'tanggal_penawaran' => Carbon::now()->subDays(4)->toDateString(),
            ],
            [
                'id_lamaran' => $lamaranIds[6],
                'nominal_gaji' => 17500000,
                'posisi_kerja' => 'Data Analyst',
                'lokasi_kerja' => 'Jakarta Pusat',
                'status_penawaran' => 'Diterima',
                'tanggal_penawaran' => Carbon::now()->subDays(3)->toDateString(),
            ],
            [
                'id_lamaran' => $lamaranIds[7],
                'nominal_gaji' => 18000000,
                'posisi_kerja' => 'Product Manager',
                'lokasi_kerja' => 'Jakarta Selatan',
                'status_penawaran' => 'Ditolak',
                'tanggal_penawaran' => Carbon::now()->subDays(1)->toDateString(),
            ],
        ];

        DB::table('penawaran')->insert($offers);
    }
}
