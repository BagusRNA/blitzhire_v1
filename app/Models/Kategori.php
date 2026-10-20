<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'kategori';
    protected $primaryKey = 'id_kategori';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_kategori', 'id_konfigurasi', 'urutan', 'nama_kategori', 'bobot', 'kode_kategori'
    ];

    public function konfigurasi()
    {
        return $this->belongsTo(Konfigurasi::class, 'id_konfigurasi', 'id_konfigurasi');
    }

    public function kataKunci()
    {
        return $this->hasMany(KataKunci::class, 'id_kategori', 'id_kategori');
    }
}
