<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SosialMedia extends Model
{
    protected $table = 'sosial_media';
    protected $primaryKey = 'id_sosmed';

    protected $fillable = [
        'id_pelamar', 'platform', 'link_sosmed'
    ];

    public function pelamar()
    {
        return $this->belongsTo(Pelamar::class, 'id_pelamar', 'id_pelamar');
    }
}
