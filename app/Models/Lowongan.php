<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    protected $table = 'lowongan';
    protected $primaryKey = 'id_lowongan';

    protected $fillable = [
        'id_hrd', 'posisi', 'lokasi', 'status_lowongan', 'tipe_pekerjaan', 
        'departemen', 'deskripsi', 'kualifikasi', 'tanggal_buka', 'tanggal_tutup', 'gaji_min', 'gaji_max'
    ];

    public function hrd()
    {
        return $this->belongsTo(HRD::class, 'id_hrd', 'id_hrd');
    }

    public function lamaran()
    {
        return $this->hasMany(Lamaran::class, 'id_lowongan', 'id_lowongan');
    }
}
