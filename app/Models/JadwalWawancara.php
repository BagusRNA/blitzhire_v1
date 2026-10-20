<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalWawancara extends Model
{
    protected $table = 'jadwal_wawancara';
    protected $primaryKey = 'id_wawancara';
    public $timestamps = false;

    protected $fillable = [
        'id_lamaran', 'tanggal_wawancara', 'lokasi', 'interviewer', 
        'status_wawancara', 'format_wawancara', 'link_meeting', 'catatan', 'hasil_assigment'
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }
}
