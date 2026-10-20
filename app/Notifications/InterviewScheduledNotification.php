<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\JadwalWawancara;

class InterviewScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $jadwalWawancara;

    public function __construct(JadwalWawancara $jadwalWawancara)
    {
        $this->jadwalWawancara = $jadwalWawancara;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lokasi = $this->jadwalWawancara->format_wawancara === 'Online' 
            ? 'Meeting Link: ' . $this->jadwalWawancara->link_meeting 
            : 'Lokasi: ' . $this->jadwalWawancara->lokasi;

        return (new MailMessage)
                    ->subject('Undangan Wawancara - BlitzHire')
                    ->greeting('Halo ' . $notifiable->nama_lengkap . ',')
                    ->line('Selamat! Anda diundang untuk mengikuti sesi wawancara untuk posisi ' . $this->jadwalWawancara->lamaran->lowongan->posisi . '.')
                    ->line('Detail Wawancara:')
                    ->line('Tanggal: ' . $this->jadwalWawancara->tanggal_wawancara)
                    ->line('Format: ' . $this->jadwalWawancara->format_wawancara)
                    ->line($lokasi)
                    ->line('Interviewer: ' . $this->jadwalWawancara->interviewer)
                    ->action('Lihat Dashboard Anda', url('/pelamar/dashboard'))
                    ->line('Terima kasih telah melamar di perusahaan kami.');
    }
}
