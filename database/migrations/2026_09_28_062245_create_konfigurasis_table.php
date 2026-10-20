<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konfigurasi', function (Blueprint $table) {
            $table->uuid('id_konfigurasi')->primary();
            $table->unsignedBigInteger('id_lowongan'); // Matches Int type from lowongan
            $table->integer('Skor_lolos_otomatis');
            $table->integer('Skor_min');
            $table->integer('Skor_gagal_otomatis');

            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konfigurasi');
    }
};
