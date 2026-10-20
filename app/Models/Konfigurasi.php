<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Konfigurasi extends Model
{
    protected $table = 'konfigurasi';
    protected $primaryKey = 'id_konfigurasi';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_konfigurasi', 'id_lowongan', 'Skor_lolos_otomatis', 'Skor_min', 'Skor_gagal_otomatis'
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }
    
    public function kategori()
    {
        return $this->hasMany(Kategori::class, 'id_konfigurasi', 'id_konfigurasi');
    }
}
