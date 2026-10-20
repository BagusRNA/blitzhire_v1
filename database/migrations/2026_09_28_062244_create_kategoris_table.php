<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori', function (Blueprint $table) {
            $table->uuid('id_kategori')->primary();
            $table->uuid('id_konfigurasi');
            $table->string('urutan', 100);
            $table->string('nama_kategori', 255);
            $table->string('bobot', 255);
            $table->dateTime('kode_kategori');

            $table->foreign('id_konfigurasi')->references('id_konfigurasi')->on('konfigurasi')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategori');
    }
};
