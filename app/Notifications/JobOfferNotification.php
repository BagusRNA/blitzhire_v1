<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Penawaran;

class JobOfferNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $penawaran;

    public function __construct(Penawaran $penawaran)
    {
        $this->penawaran = $penawaran;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Penawaran Pekerjaan - BlitzHire')
                    ->greeting('Halo ' . $notifiable->nama_lengkap . ',')
                    ->line('Selamat! Anda telah terpilih untuk bergabung dengan kami.')
                    ->line('Berikut adalah detail penawaran untuk posisi ' . $this->penawaran->posisi_kerja . ':')
                    ->line('Lokasi Kerja: ' . $this->penawaran->lokasi_kerja)
                    ->line('Nominal Gaji: Rp ' . number_format($this->penawaran->nominal_gaji, 0, ',', '.'))
                    ->action('Tinjau Penawaran di Dashboard', url('/pelamar/dashboard'))
                    ->line('Mohon segera konfirmasi penerimaan tawaran ini melalui dashboard Anda.');
    }
}
