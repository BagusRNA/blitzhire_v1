<?php

namespace App\Services;

use App\Models\Lamaran;
use App\Models\KataKunci;

class ScoringService
{
    /**
     * Calculate baseline score (skor_kecocokan) based on extracted CV text and keywords.
     * 
     * @param Lamaran $lamaran The application record
     * @param string $extractedCvText Text extracted from the candidate's CV
     * @return float
     */
    public function calculateScore(Lamaran $lamaran, string $extractedCvText)
    {
        // Get the specific job posting associated with this application
        $lowongan = $lamaran->lowongan;
        
        // Assume we have a configurasi record for this lowongan
        $konfigurasi = $lowongan->konfigurasi; // Needs hasOne mapping in Lowongan model if not present, but for now we query it directly
        if (!$konfigurasi) {
            $konfigurasi = \App\Models\Konfigurasi::where('id_lowongan', $lowongan->id_lowongan)->first();
        }

        if (!$konfigurasi) {
            return 0.0;
        }

        $totalScore = 0.0;
        $extractedCvText = strtolower($extractedCvText);

        // Loop through categories tied to the configuration
        $kategoriList = $konfigurasi->kategori()->with('kataKunci')->get();

        foreach ($kategoriList as $kategori) {
            $bobot = (float) $kategori->bobot; // e.g., '10.5'
            
            // Loop through keywords for each category
            foreach ($kategori->kataKunci as $kataKunci) {
                $keyword = strtolower($kataKunci->kata_kunci);
                
                // Baseline check: if keyword exists in CV text, add its weight
                if (strpos($extractedCvText, $keyword) !== false) {
                    $totalScore += $bobot;
                }
            }
        }

        // Apply rules based on Skor_lolos_otomatis, Skor_min, etc (Optional advanced logic)
        // ...

        // Update the database record
        $lamaran->update(['skor_kecocokan' => $totalScore]);

        return $totalScore;
    }
}
