<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hrd', function (Blueprint $table) {
            $table->id('id_hrd');
            $table->string('nama_pengguna', 100);
            $table->string('email', 100)->unique();
            $table->string('kata_sandi', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hrd');
    }
};
