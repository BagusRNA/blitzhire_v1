<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surat Keputusan Penerimaan — {{ $lamaran->pelamar->nama_lengkap ?? 'Pelamar' }}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111;
            margin: 0;
            padding: 40px;
            background: #f3f4f6;
        }
        .page {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 50px 60px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }
        .kop-surat {
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .kop-logo {
            font-size: 24px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.1;
        }
        .kop-info {
            text-align: right;
            font-size: 11px;
            font-family: Arial, sans-serif;
            color: #4b5563;
            line-height: 1.4;
        }
        .title {
            text-align: center;
            margin-bottom: 25px;
        }
        .title h2 {
            margin: 0;
            font-size: 18px;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .title p {
            margin: 5px 0 0;
            font-size: 13px;
        }
        .content {
            font-size: 14px;
            line-height: 1.6;
            text-align: justify;
        }
        .content table {
            width: 100%;
            margin: 15px 0;
            border-collapse: collapse;
        }
        .content table td {
            padding: 4px 0;
            vertical-align: top;
            font-size: 14px;
        }
        .content table td:first-child {
            width: 200px;
        }
        .content table td:nth-child(2) {
            width: 15px;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            text-align: center;
            width: 250px;
            font-size: 14px;
        }
        .signature-space {
            height: 70px;
        }
        .btn-print {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #000;
            color: #fff;
            padding: 12px 24px;
            border-radius: 6px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: bold;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .btn-print:hover {
            background: #333;
        }
        @media print {
            body {
                background: #fff;
                padding: 0;
            }
            .page {
                box-shadow: none;
                border: none;
                padding: 0;
            }
            .btn-print {
                display: none;
            }
        }
    </style>
</head>
<body>

    <button class="btn-print" onclick="window.print()">🖨️ CETAK / SIMPAN SEBAGAI PDF</button>

    <div class="page">
        <!-- Kop Surat -->
        <div class="kop-surat">
            <div class="kop-logo">
                <span style="color:#FF7200;">CYBERS BLITZ</span><br>
                <span>NUSANTARA</span>
            </div>
            <div class="kop-info">
                <strong>PT CYBERS BLITZ NUSANTARA</strong><br>
                Menara Blitz Lt. 18, Kawasan Bisnis Terpadu<br>
                Jakarta Selatan, DKI Jakarta 12190<br>
                Email: hr@cybersblitz.id | Web: https://cybersblitz.id
            </div>
        </div>

        <!-- Judul Surat -->
        <div class="title">
            <h2>SURAT KEPUTUSAN PENERIMAAN KARYAWAN</h2>
            <p>Nomor: SK/HRD/CBN/{{ date('Y') }}/#{{ str_pad($lamaran->id_lamaran, 4, '0', STR_PAD_LEFT) }}</p>
        </div>

        <!-- Isi Surat -->
        <div class="content">
            <p>Berdasarkan hasil evaluasi kualifikasi, berkas administrasi, serta rangkaian tahapan seleksi wawancara dan uji kompetensi yang telah dilaksanakan, Direksi dan Manajemen PT Cybers Blitz Nusantara dengan ini memutuskan:</p>

            <table>
                <tr>
                    <td>Nama Lengkap</td>
                    <td>:</td>
                    <td><strong>{{ $lamaran->pelamar->nama_lengkap ?? 'Kandidat' }}</strong></td>
                </tr>
                <tr>
                    <td>Nomor Referensi</td>
                    <td>:</td>
                    <td>#{{ str_pad($lamaran->id_lamaran, 4, '0', STR_PAD_LEFT) }}</td>
                </tr>
                <tr>
                    <td>Posisi Diterima</td>
                    <td>:</td>
                    <td><strong>{{ $lamaran->lowongan->posisi ?? 'Frontend Engineer' }}</strong></td>
                </tr>
                <tr>
                    <td>Departemen</td>
                    <td>:</td>
                    <td>{{ $lamaran->lowongan->departemen ?? 'Engineering' }}</td>
                </tr>
                <tr>
                    <td>Tipe Pekerjaan</td>
                    <td>:</td>
                    <td>{{ $lamaran->lowongan->tipe_pekerjaan ?? 'Full-Time' }}</td>
                </tr>
                <tr>
                    <td>Tanggal Keputusan</td>
                    <td>:</td>
                    <td>{{ \Carbon\Carbon::parse($lamaran->updated_at ?? now())->translatedFormat('d F Y') }}</td>
                </tr>
            </table>

            <p>Dinyatakan <strong>RESMI DITERIMA</strong> sebagai bagian dari keluarga besar PT Cybers Blitz Nusantara. Keputusan ini bersifat mutlak dan mulai berlaku sejak tanggal ditetapkan.</p>

            <p>Rincian perjanjian kerja, hak dan kewajiban, serta jadwal onboarding hari pertama kerja akan disampaikan lebih lanjut oleh Divisi Human Resources Development (HRD).</p>
        </div>

        <!-- Tanda Tangan -->
        <div class="signature-section">
            <div class="signature-box">
                <p>Kandidat yang Diterima,</p>
                <div class="signature-space"></div>
                <p><strong>{{ $lamaran->pelamar->nama_lengkap ?? 'Kandidat' }}</strong></p>
            </div>
            <div class="signature-box">
                <p>Jakarta, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>Human Resources Department</p>
                <div class="signature-space"></div>
                <p><strong>HRD Manager</strong><br>PT Cybers Blitz Nusantara</p>
            </div>
        </div>
    </div>

</body>
</html>
