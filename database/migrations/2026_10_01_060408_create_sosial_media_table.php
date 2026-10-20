<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sosial_media', function (Blueprint $table) {
            $table->id('id_sosmed');
            $table->unsignedBigInteger('id_pelamar');
            $table->string('platform');
            $table->string('link_sosmed');
            $table->timestamps();

            $table->foreign('id_pelamar')->references('id_pelamar')->on('pelamar')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sosial_media');
    }
};
