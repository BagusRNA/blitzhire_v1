<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penawaran extends Model
{
    protected $table = 'penawaran';
    protected $primaryKey = 'id_penawaran';
    public $timestamps = false;

    protected $fillable = [
        'id_lamaran', 'nominal_gaji', 'posisi_kerja', 'lokasi_kerja', 
        'status_penawaran', 'tanggal_penawaran'
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }
}
