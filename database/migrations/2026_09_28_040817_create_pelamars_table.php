<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pelamar', function (Blueprint $table) {
            $table->id('id_pelamar');
            $table->string('nama_lengkap', 100);
            $table->string('email', 100)->unique();
            $table->string('kata_sandi', 100);
            $table->string('nomor_hp', 20);
            $table->string('alamat', 255);
            $table->string('pendidikan_terakhir', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pelamar');
    }
};
