<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Pelamar extends Authenticatable
{
    protected $table = 'pelamar';
    protected $primaryKey = 'id_pelamar';

    protected $fillable = [
        'nama_lengkap', 'email', 'kata_sandi', 'nomor_hp', 'alamat', 'pendidikan_terakhir'
    ];
    protected $hidden = ['kata_sandi'];

    public function getAuthPassword()
    {
        return $this->kata_sandi;
    }

    public function lamaran()
    {
        return $this->hasMany(Lamaran::class, 'id_pelamar', 'id_pelamar');
    }

    public function sosialMedia()
    {
        return $this->hasMany(SosialMedia::class, 'id_pelamar', 'id_pelamar');
    }
}
