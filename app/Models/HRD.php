<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class HRD extends Authenticatable
{
    protected $table = 'hrd';
    protected $primaryKey = 'id_hrd';

    protected $fillable = ['nama_pengguna', 'email', 'kata_sandi'];
    protected $hidden = ['kata_sandi'];

    // Map Laravel's default password check to 'kata_sandi'
    public function getAuthPassword()
    {
        return $this->kata_sandi;
    }

    public function lowongan()
    {
        return $this->hasMany(Lowongan::class, 'id_hrd', 'id_hrd');
    }
}
