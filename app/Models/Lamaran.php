<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Lamaran extends Model
{
    protected $table = 'lamaran';
    protected $primaryKey = 'id_lamaran';

    protected $fillable = [
        'id_pelamar', 'id_lowongan', 'tanggal_lamaran', 'status_lamaran', 'skor_kecocokan'
    ];

    public function pelamar()
    {
        return $this->belongsTo(Pelamar::class, 'id_pelamar', 'id_pelamar');
    }

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function dokumen()
    {
        return $this->hasMany(DokumenPelamar::class, 'id_lamaran', 'id_lamaran');
    }

    public function wawancara()
    {
        return $this->hasMany(JadwalWawancara::class, 'id_lamaran', 'id_lamaran');
    }

    public function penawaran()
    {
        return $this->hasMany(Penawaran::class, 'id_lamaran', 'id_lamaran');
    }
}
