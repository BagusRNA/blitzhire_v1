<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_wawancara', function (Blueprint $table) {
            $table->id('id_wawancara');
            $table->unsignedBigInteger('id_lamaran');
            $table->dateTime('tanggal_wawancara');
            $table->string('lokasi', 150);
            $table->string('interviewer', 100);
            $table->enum('status_wawancara', ['Terjadwal', 'Selesai', 'Ditunda', 'Dibatalkan']);
            $table->string('format_wawancara', 20);
            $table->string('link_meeting', 225)->nullable();
            $table->text('catatan')->nullable();
            $table->text('hasil_assigment')->nullable();

            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_wawancara');
    }
};
