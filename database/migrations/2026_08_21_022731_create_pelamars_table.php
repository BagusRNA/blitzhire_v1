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
        Schema::create('pelamar', function (Blueprint $table) {
            $table->id('id_pelamar');
            $table->string('nama_lengkap');
            $table->string('email')->unique();
            $table->string('kata_sandi');
            $table->string('nomor_hp');
            $table->text('alamat');
            $table->string('pendidikan_terakhir');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pelamar');
    }
};
