<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kata_kunci', function (Blueprint $table) {
            $table->id('id_kata_kunci');
            $table->uuid('id_kategori'); // Match uuid from kategori
            $table->string('kata_kunci', 100);
            $table->timestamps();

            $table->foreign('id_kategori')->references('id_kategori')->on('kategori')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kata_kunci');
    }
};
