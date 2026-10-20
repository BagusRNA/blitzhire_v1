<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lamaran', function (Blueprint $table) {
            $table->id('id_lamaran');
            $table->unsignedBigInteger('id_pelamar');
            $table->unsignedBigInteger('id_lowongan');
            $table->date('tanggal_lamaran');
            $table->string('status_lamaran', 30);
            $table->decimal('skor_kecocokan', 15, 2)->nullable();
            $table->timestamps();

            $table->foreign('id_pelamar')->references('id_pelamar')->on('pelamar')->onDelete('cascade');
            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lamaran');
    }
};
