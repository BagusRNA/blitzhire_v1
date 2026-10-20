<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DokumenPelamar extends Model
{
    protected $table = 'dokumen_pelamar';
    protected $primaryKey = 'id_dokumen';

    public $timestamps = false; // Based on schema, we have tanggal_upload manually managed or we use Eloquent's if updated_at is omitted. Let's disable default timestamps and handle tanggal_upload.

    protected $fillable = [
        'id_lamaran', 'jenis_dokumen', 'file_dokumen', 'path_file', 'tanggal_upload'
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }
}
