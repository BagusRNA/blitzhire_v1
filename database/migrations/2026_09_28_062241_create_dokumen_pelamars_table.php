<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_pelamar', function (Blueprint $table) {
            $table->id('id_dokumen');
            $table->unsignedBigInteger('id_lamaran');
            $table->string('jenis_dokumen', 100);
            $table->string('file_dokumen', 255);
            $table->string('path_file', 255);
            $table->dateTime('tanggal_upload');

            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_pelamar');
    }
};
