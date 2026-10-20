<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lowongan', function (Blueprint $table) {
            $table->id('id_lowongan');
            $table->unsignedBigInteger('id_hrd');
            $table->string('posisi', 100);
            $table->string('lokasi', 100);
            $table->string('status_lowongan', 30);
            $table->string('tipe_pekerjaan', 30);
            $table->string('departemen', 100);
            $table->text('deskripsi');
            $table->text('kualifikasi');
            $table->date('tanggal_buka');
            $table->date('tanggal_tutup');
            $table->decimal('gaji_min', 15, 2);
            $table->decimal('gaji_max', 15, 2);
            $table->timestamps();

            $table->foreign('id_hrd')->references('id_hrd')->on('hrd')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lowongan');
    }
};
