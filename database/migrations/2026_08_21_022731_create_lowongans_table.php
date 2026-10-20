<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lowongan', function (Blueprint $table) {
            $table->id('id_lowongan');
            $table->unsignedBigInteger('id_hrd');
            $table->string('posisi');
            $table->string('lokasi');
            $table->string('tipe_pekerjaan');
            $table->text('deskripsi');
            $table->text('kualifikasi');
            $table->string('judul_lowongan');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lowongans');
    }
};
