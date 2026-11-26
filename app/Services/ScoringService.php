<?php

namespace App\Services;

use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\Konfigurasi;

class ScoringService
{
    /**
     * Extract text content from a PDF file.
     *
     * @param string $filePath
     * @return string
     */
    public function extractTextFromPdf(string $filePath): string
    {
        if (!file_exists($filePath) || filesize($filePath) === 0) {
            return '';
        }

        $content = @file_get_contents($filePath);
        if ($content === false || strlen($content) === 0) {
            return '';
        }

        $text = '';

        // Check for PDF stream blocks
        if (preg_match_all('#stream[\r\n]+(.*?)[\r\n]+endstream#s', $content, $matches)) {
            foreach ($matches[1] as $stream) {
                $uncompressed = @gzuncompress($stream);
                $data = ($uncompressed !== false) ? $uncompressed : $stream;

                if (preg_match_all('#\((.*?)\)\s*Tj#s', $data, $textMatches)) {
                    $text .= ' ' . implode(' ', $textMatches[1]);
                }
                if (preg_match_all('#\[(.*?)\]\s*TJ#s', $data, $arrayMatches)) {
                    foreach ($arrayMatches[1] as $arr) {
                        if (preg_match_all('#\((.*?)\)#s', $arr, $subMatches)) {
                            $text .= ' ' . implode(' ', $subMatches[1]);
                        }
                    }
                }
            }
        }

        // Fallback for plain-text / non-compressed PDF text
        if (empty(trim($text))) {
            $clean = preg_replace('/[^\x20-\x7E\r\n\t]/', ' ', $content);
            $clean = preg_replace('/obj|endobj|stream|endstream|xref|trailer|startxref/i', ' ', $clean);
            $clean = trim(preg_replace('/\s+/', ' ', $clean));
            if (strlen($clean) > 30) {
                $text = $clean;
            }
        }

        return trim($text);
    }

    /**
     * Calculate score (skor_kecocokan) based on extracted CV text and job requirements.
     *
     * @param Lamaran $lamaran
     * @param string $extractedCvText
     * @return float
     */
    public function calculateScore(Lamaran $lamaran, string $extractedCvText): float
    {
        $trimmedCv = trim($extractedCvText);

        // Pelamar 9: Jika isi CV kosong, skor kecocokan adalah 0%
        if (empty($trimmedCv)) {
            $lamaran->update(['skor_kecocokan' => 0.0]);
            return 0.0;
        }

        $lowongan = $lamaran->lowongan;
        if (!$lowongan) {
            $lowongan = Lowongan::find($lamaran->id_lowongan);
        }

        if (!$lowongan) {
            $lamaran->update(['skor_kecocokan' => 0.0]);
            return 0.0;
        }

        // Kumpulkan kata kunci dari posisi, kualifikasi, deskripsi, dan konfigurasi penilaian
        $keywords = [];

        // 1. Dari posisi lowongan
        $posisi = $lowongan->posisi ?? $lowongan->judul_lowongan ?? '';
        foreach (explode(' ', strtolower($posisi)) as $word) {
            $word = trim($word);
            if (strlen($word) > 2) {
                $keywords[] = $word;
            }
        }

        // 2. Dari kualifikasi lowongan
        if (!empty($lowongan->kualifikasi)) {
            $lines = preg_split('/[\r\n,;-]+/', strtolower($lowongan->kualifikasi));
            foreach ($lines as $line) {
                $line = trim($line);
                if (strlen($line) > 2) {
                    $keywords[] = $line;
                }
            }
        }

        // 3. Dari deskripsi lowongan
        if (!empty($lowongan->deskripsi)) {
            $words = preg_split('/[\s,;.()\/-]+/', strtolower($lowongan->deskripsi));
            foreach ($words as $w) {
                $w = trim($w);
                if (strlen($w) > 4 && !in_array($w, ['dengan', 'untuk', 'dalam', 'yang', 'serta', 'dapat', 'memiliki', 'adalah'])) {
                    $keywords[] = $w;
                }
            }
        }

        // 4. Dari Konfigurasi Kata Kunci HRD jika ada
        $konfigurasi = Konfigurasi::where('id_lowongan', $lowongan->id_lowongan)->first();
        if ($konfigurasi) {
            $kategoriList = $konfigurasi->kategori()->with('kataKunci')->get();
            foreach ($kategoriList as $kategori) {
                foreach ($kategori->kataKunci as $kk) {
                    $kWord = strtolower(trim($kk->kata_kunci));
                    if (!empty($kWord)) {
                        $keywords[] = $kWord;
                    }
                }
            }
        }

        // Default competency keywords
        $defaultSkills = ['laravel', 'react', 'php', 'javascript', 'sql', 'mysql', 'postgresql', 'figma', 'ui', 'ux', 'html', 'css', 'tailwind', 'git', 'api', 'komunikasi', 'teamwork', 's1', 'd3', 'teknik', 'informatika'];
        $keywords = array_unique(array_merge($keywords, $defaultSkills));

        $lowerCv = strtolower($trimmedCv);
        $matchedCount = 0;
        $totalKeywords = count($keywords);

        foreach ($keywords as $kw) {
            if (str_contains($lowerCv, $kw)) {
                $matchedCount++;
            }
        }

        if ($matchedCount === 0) {
            $score = 0.0;
        } else {
            // Hitung persentase kecocokan
            $ratio = $matchedCount / max(1, min($totalKeywords, 15));
            $score = round(min(98.0, max(20.0, $ratio * 100)), 1);
        }

        $lamaran->update(['skor_kecocokan' => $score]);
        return $score;
    }
}
