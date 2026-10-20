<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KataKunci extends Model
{
    protected $table = 'kata_kunci';
    protected $primaryKey = 'id_kata_kunci';

    protected $fillable = [
        'id_kategori', 'kata_kunci'
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }
}
