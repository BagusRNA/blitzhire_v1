<?php

namespace App\Http\Controllers;

use App\Models\Lamaran;
use App\Models\JadwalWawancara;
use App\Models\Penawaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HRDCandidateController extends Controller
{
    /**
     * Display a listing of candidates for a specific job posting.
     */
    public function index($id_lowongan)
    {
        $kandidat = Lamaran::with(['pelamar', 'dokumen', 'wawancara', 'penawaran'])
            ->where('id_lowongan', $id_lowongan)
            ->get();

        return Inertia::render('HRD/Kandidat/Index', [
            'kandidat' => $kandidat,
            'id_lowongan' => $id_lowongan
        ]);
    }

    /**
     * Update Candidate Application Status (e.g., Screening -> Interview).
     */
    public function updateStatus(Request $request, $id_lamaran)
    {
        $request->validate([
            'status_lamaran' => 'required|string|max:30'
        ]);

        $lamaran = Lamaran::findOrFail($id_lamaran);
        $lamaran->update(['status_lamaran' => $request->status_lamaran]);

        return back()->with('success', 'Candidate status updated.');
    }

    /**
     * Schedule an Interview for the candidate.
     */
    public function scheduleInterview(Request $request, $id_lamaran)
    {
        $request->validate([
            'tanggal_wawancara' => 'required|date',
            'lokasi'            => 'nullable|string|max:150',
            'interviewer'       => 'required|string|max:100',
            'format_wawancara'  => 'required|in:Online,Offline',
            'link_meeting'      => 'nullable|max:225',
            'catatan'           => 'nullable|string',
        ]);

        $jadwal = JadwalWawancara::create([
            'id_lamaran'        => $id_lamaran,
            'tanggal_wawancara' => $request->tanggal_wawancara,
            'lokasi'            => $request->lokasi ?? '-',
            'interviewer'       => $request->interviewer,
            'status_wawancara'  => 'Terjadwal',
            'format_wawancara'  => $request->format_wawancara,
            'link_meeting'      => $request->link_meeting,
            'catatan'           => $request->catatan,
        ]);

        // Auto-update status lamaran → Wawancara
        $lamaran = Lamaran::with('pelamar')->findOrFail($id_lamaran);
        $lamaran->update(['status_lamaran' => 'Wawancara']);

        // Kirim notifikasi email
        try {
            $lamaran->pelamar->notify(new \App\Notifications\InterviewScheduledNotification($jadwal));
        } catch (\Exception $e) {
            // Tidak gagalkan proses jika email error
        }

        return redirect()->route('hrd.kandidat.status_wawancara', $id_lamaran)
            ->with('success', 'Jadwal wawancara berhasil disimpan.');
    }

    /**
     * Send a Job Offer to the candidate.
     */
    public function sendOffer(Request $request, $id_lamaran)
    {
        $request->validate([
            'nominal_gaji' => 'required|numeric|min:0',
            'posisi_kerja' => 'required|string|max:100',
            'lokasi_kerja' => 'required|string|max:100'
        ]);

        $penawaran = Penawaran::create([
            'id_lamaran' => $id_lamaran,
            'nominal_gaji' => $request->nominal_gaji,
            'posisi_kerja' => $request->posisi_kerja,
            'lokasi_kerja' => $request->lokasi_kerja,
            'status_penawaran' => 'Menunggu',
            'tanggal_penawaran' => now()->toDateString()
        ]);

        // Auto-update candidate status
        $lamaran = Lamaran::with('pelamar')->findOrFail($id_lamaran);
        $lamaran->update(['status_lamaran' => 'Offer']);

        // Send Email Notification
        $lamaran->pelamar->notify(new \App\Notifications\JobOfferNotification($penawaran));

        return back()->with('success', 'Job offer sent successfully.');
    }
}
