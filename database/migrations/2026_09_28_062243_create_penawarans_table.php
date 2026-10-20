<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penawaran', function (Blueprint $table) {
            $table->id('id_penawaran');
            $table->unsignedBigInteger('id_lamaran');
            $table->decimal('nominal_gaji', 12, 2);
            $table->string('posisi_kerja', 100);
            $table->string('lokasi_kerja', 100);
            $table->enum('status_penawaran', ['Menunggu', 'Diterima', 'Ditolak']);
            $table->date('tanggal_penawaran');

            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penawaran');
    }
};
