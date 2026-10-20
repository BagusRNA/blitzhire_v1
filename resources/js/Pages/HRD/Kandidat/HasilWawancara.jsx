import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function HasilWawancara({ lamaran, jadwalTerakhir }) {
    const [note, setNote] = useState(jadwalTerakhir?.catatan ?? '');
    
    const handleAction = (action) => {
        if (confirm(`Yakin ingin ${action.toUpperCase()} kandidat ini?`)) {
            // Ideally we'd save the note too, but for UI mockup purposes we just submit the decision
            router.post(route(`hrd.kandidat.${action}`, lamaran.id_lamaran), { catatan: note });
        }
    };

    return (
        <KandidatDetailLayout title="Jadwal Wawancara" lamaran={lamaran}>
            
            <div className="kandidat-form-flow">
                {/* Note Field */}
                <div className="form-group">
                    <label className="form-label-base">Note</label>
                    <textarea
                        className="form-textarea-lg"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Tuliskan hasil atau catatan wawancara di sini..."
                    ></textarea>
                </div>

                {/* Actions */}
                <div className="kandidat-action-grid-2">
                    <button onClick={() => handleAction('tolak')} className="btn-secondary w-full text-base">
                        TOLAK
                    </button>
                    <button onClick={() => handleAction('lanjut_penawaran')} className="btn-primary w-full text-base">
                        LANJUT KE PENAWARAN
                    </button>
                </div>
            </div>
            
        </KandidatDetailLayout>
    );
}
